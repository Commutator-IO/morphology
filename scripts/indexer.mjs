/**
 * Builds the vocabulary index: for every term in the lexicon, where it is
 * spoken in the course.
 *
 * The subtitles live in `transcripts/`, which is not versioned: the working
 * material stays local and only the derived index — terms, counts, timestamps —
 * is published. That is also what lets CI build the site without them.
 *
 * Two indexes come out of the same machinery: the anatomical vocabulary and the
 * artistic references. A term needs only an `id` and a list of `variantes`; the
 * rest — definition, dates, category — concerns display alone.
 *
 *     npm run indexer
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { lireCorpus, accentuer, plier, motif } from './corpus.mjs';

/** Two mentions closer than this belong to the same passage, and get a single
 *  entry point. Without the rule, a term Debord dwells on for five minutes
 *  yields forty links into the same stretch. */
const FENETRE_S = 45;

/** The ASR places punctuation at random, so we back up a few seconds and land
 *  before the word rather than after it. */
const AMORCE_S = 4;

/** How much surrounding text, in characters, is read to settle an ambiguous
 *  word. "Fléchisseur" means the forearm as readily as the leg; only the
 *  passage around it says which. Six hundred characters is about a minute of
 *  speech — enough to catch "orteil" or "poignet", not enough to drag in the
 *  previous subject. */
const CONTEXTE_C = 600;

/** The two surveys to produce: where the list comes from, where it goes. */
const RELEVES = [
  { nom: 'vocabulaire', lexique: 'lexique.json', sortie: 'occurrences.json' },
  { nom: 'références', lexique: 'references.json', sortie: 'occurrences-references.json' },
];

// Read once for both surveys: it is 59 MB of subtitles.
const corpus = lireCorpus();

/**
 * A video's continuous text, plus the table turning a character offset back
 * into a moment.
 *
 * Subtitle segments run two or three words: a phrase like "crête iliaque"
 * almost always straddles two of them. Searching segment by segment would miss
 * it half the time, hence the concatenation.
 */
function aplatir(video) {
  let plie = '';
  let accentue = '';
  const jalons = []; // { offset, t }
  for (const s of video.segments) {
    const a = accentuer(s.texte).replace(/\s+/g, ' ').trim();
    if (!a) continue;
    jalons.push({ offset: plie.length, t: s.t });
    accentue += a + ' ';
    plie += plier(a) + ' ';
  }
  // The two texts fold character for character, so one offset serves both:
  // search in either, timestamp from the other.
  return { plie, accentue, jalons };
}

function instantDe(jalons, offset) {
  // Binary search for the last marker starting before the offset.
  let lo = 0, hi = jalons.length - 1, r = 0;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (jalons[m].offset <= offset) { r = m; lo = m + 1; } else hi = m - 1;
  }
  return jalons[r].t;
}

const echappe = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');

/**
 * Three patterns per term: one searched on the folded text, one — variants
 * prefixed "!" — on the accented text, and a third — those prefixed "?" — held
 * for arbitration, because the word alone names no single notion: two terms may
 * claim it, and the surrounding words decide (see `arbitrer`).
 *
 * The longest variant goes first so that "grand dorsal" beats "dorsal" instead
 * of being counted twice.
 */
function motifsDe(terme) {
  const range = (vs, avecAccents) => {
    const u = [...new Set(vs.map((v) => motif(v, avecAccents)).filter(Boolean))]
      .sort((a, b) => b.length - a.length)
      .map(echappe);
    return u.length ? new RegExp(`\\b(?:${u.join('|')})\\b`, 'g') : null;
  };
  const strictes = terme.variantes.filter((v) => v.startsWith('!')).map((v) => v.slice(1));
  const ambigues = terme.variantes.filter((v) => v.startsWith('?')).map((v) => v.slice(1));
  const vetos = terme.variantes.filter((v) => v.startsWith('-')).map((v) => v.slice(1));
  const souples = terme.variantes.filter((v) => !/^[!?-]/.test(v));
  return {
    souple: range(souples, false),
    strict: range(strictes, true),
    ambigu: range(ambigues, false),
    veto: range(vetos, false),
    contexte: (terme.contexte ?? []).map((m) => motif(m)).filter(Boolean),
  };
}

/**
 * Positions that a phrase, checked by ear, marks as not being the notion —
 * variants prefixed "-". "Master i dit" is mastoiditis and not the masseter,
 * "modèle des États-Unis" a motel and not the model: nobody may win these
 * positions, not even through a whole-phrase variant. A veto holds for every
 * term, whichever one carries it.
 */
function positionsInterdites(plie, lexique) {
  const spans = [];
  for (const terme of lexique) {
    const { veto } = motifsDe(terme);
    if (!veto) continue;
    for (const m of plie.matchAll(veto)) spans.push([m.index, m.index + m[0].length]);
  }
  // The cancelling phrase rarely starts on the word it cancels: "un bout de
  // trapèze" says the trapèze three words along is not the muscle. So the whole
  // span is barred, not just its first offset.
  return (offset) => spans.some(([a, b]) => offset >= a && offset < b);
}

/**
 * How many of a term's context words surround this position.
 *
 * The count, not mere presence: when "fléchisseur" falls in a passage about the
 * hand that mentions the foot in passing, it is the number of words on each
 * side that tips the balance.
 */
function poidsDuContexte(plie, offset, mots) {
  const fenetre = plie.slice(Math.max(0, offset - CONTEXTE_C), offset + CONTEXTE_C);
  let n = 0;
  for (const mot of mots) {
    const re = new RegExp(`\\b${echappe(mot)}\\b`, 'g');
    n += [...fenetre.matchAll(re)].length;
  }
  return n;
}

/**
 * Awards each ambiguous mention to the term whose surroundings speak loudest.
 * A term already holding the position through a whole-phrase variant has won it
 * beforehand; a position nobody claims more strongly than another is dropped,
 * since a misfiled mention costs more than a lost one.
 */
function arbitrer(plie, litiges, tenues, motsDe) {
  const gagnees = new Map(); // id du terme -> offsets
  let rendues = 0;
  let perdues = 0;
  for (const [offset, candidats] of litiges) {
    if (tenues.has(offset)) continue;
    let meilleur = null;
    let second = 0;
    for (const id of candidats) {
      const poids = poidsDuContexte(plie, offset, motsDe.get(id));
      if (!meilleur || poids > meilleur.poids) { second = meilleur?.poids ?? 0; meilleur = { id, poids }; }
      else if (poids > second) second = poids;
    }
    if (!meilleur || meilleur.poids === 0 || meilleur.poids === second) { perdues++; continue; }
    if (!gagnees.has(meilleur.id)) gagnees.set(meilleur.id, []);
    gagnees.get(meilleur.id).push(offset);
    rendues++;
  }
  return { gagnees, rendues, perdues };
}

function relever({ nom, lexique: fichier, sortie: fichierSortie }) {
  const lexique = JSON.parse(readFileSync(new URL(`../src/data/${fichier}`, import.meta.url)));

  const index = {}; // id du terme -> { total, videos: { videoId: [instants] } }

  for (const t of lexique) index[t.id] = { total: 0, videos: {} };

  let arbitrees = 0;
  let abandonnees = 0;

  for (const video of corpus) {
    const { plie, accentue, jalons } = aplatir(video);
    if (!jalons.length) continue;

    // First pass: what each term holds on its own, and what it claims without
    // being able to prove it alone.
    const fermes = new Map(); // id du terme -> offsets
    const litiges = new Map(); // offset -> [ids]
    const tenues = new Set(); // offsets déjà gagnés par une locution entière
    const motsDe = new Map(); // id du terme -> mots de contexte
    for (const terme of lexique) {
      const { souple, strict, ambigu, contexte } = motifsDe(terme);
      motsDe.set(terme.id, contexte);
      const offsets = [];
      if (souple) for (const m of plie.matchAll(souple)) offsets.push(m.index);
      if (strict) for (const m of accentue.matchAll(strict)) offsets.push(m.index);
      if (offsets.length) {
        fermes.set(terme.id, offsets);
        for (const off of offsets) tenues.add(off);
      }
      if (!ambigu || !contexte.length) continue;
      for (const m of plie.matchAll(ambigu)) {
        if (!litiges.has(m.index)) litiges.set(m.index, []);
        litiges.get(m.index).push(terme.id);
      }
    }

    // Second pass: the surroundings decide, except where a phrase forbids it.
    const interdite = positionsInterdites(plie, lexique);
    for (const off of [...litiges.keys()]) if (interdite(off)) litiges.delete(off);
    for (const [id, offsets] of fermes) {
      const reste = offsets.filter((o) => !interdite(o));
      if (reste.length !== offsets.length) {
        fermes.set(id, reste);
        for (const off of offsets) if (interdite(off)) tenues.delete(off);
      }
    }
    const { gagnees, rendues, perdues } = arbitrer(plie, litiges, tenues, motsDe);
    arbitrees += rendues;
    abandonnees += perdues;

    for (const terme of lexique) {
      const offsets = [...(fermes.get(terme.id) ?? []), ...(gagnees.get(terme.id) ?? [])]
        .sort((a, b) => a - b);
      const instants = [];
      for (const off of offsets) {
        const t = Math.max(0, instantDe(jalons, off) - AMORCE_S);
        // Merge mentions that fall close together.
        if (instants.length && t - instants[instants.length - 1] < FENETRE_S) continue;
        instants.push(t);
      }
      if (!instants.length) continue;
      index[terme.id].videos[video.id] = instants;
      index[terme.id].total += instants.length;
    }
  }

  const resultat = {
    genere: new Date().toISOString().slice(0, 10),
    fenetreS: FENETRE_S,
    videos: corpus.length,
    termes: index,
  };
  writeFileSync(
    new URL(`../src/data/${fichierSortie}`, import.meta.url),
    JSON.stringify(resultat, null, 1) + '\n',
  );

  const classe = Object.entries(index).sort((a, b) => b[1].total - a[1].total);
  const muets = classe.filter(([, v]) => v.total === 0);
  console.log(`\n[${nom}] ${corpus.length} vidéos · ${lexique.length} entrées · ` +
    `${classe.reduce((s, [, v]) => s + v.total, 0)} passages repérés`);
  console.log('\nplus relevés :');
  for (const [id, v] of classe.slice(0, 15)) {
    console.log(`  ${String(v.total).padStart(4)}  ${id}  (${Object.keys(v.videos).length} séances)`);
  }
  console.log(`\njamais relevés (${muets.length}) : ${muets.map(([id]) => id).join(', ') || '—'}`);
  if (arbitrees || abandonnees) {
    console.log(`\nmots ambigus : ${arbitrees} tranchés par le voisinage, ` +
      `${abandonnees} laissés de côté faute de voisinage net.`);
  }

}

for (const releve of RELEVES) relever(releve);
