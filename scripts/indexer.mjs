/**
 * Construit l'index du vocabulaire : pour chaque terme du lexique, où il est
 * prononcé dans le cours.
 *
 * Les sous-titres sont dans `transcripts/`, qui n'est pas versionné : la matière
 * de travail reste locale et seul l'index dérivé — termes, comptes, horodatages —
 * est publié. C'est aussi ce qui permet à la CI de construire le site sans
 * disposer des transcriptions.
 *
 * Deux index sont produits, avec la même mécanique : le vocabulaire d'anatomie
 * et les références artistiques. Un terme n'a besoin que d'un `id` et d'une
 * liste de `variantes` ; le reste — définition, dates, catégorie — ne regarde
 * que l'affichage.
 *
 *     npm run indexer
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { lireCorpus, accentuer, plier, motif } from './corpus.mjs';

/** Deux mentions séparées de moins de ça appartiennent au même passage : on ne
 *  propose qu'un seul point d'entrée, sinon un terme dont Debord parle pendant
 *  cinq minutes produit quarante liens vers le même développement. */
const FENETRE_S = 45;

/** L'ASR pose la ponctuation au hasard ; on recule de quelques secondes pour
 *  tomber avant le mot plutôt qu'après, faute de quoi on arrive en retard. */
const AMORCE_S = 4;

/** Largeur, en caractères, du voisinage lu pour trancher un mot ambigu.
 *  « Fléchisseur » se dit de l'avant-bras comme de la jambe : seul le passage
 *  autour le dit. Six cents caractères valent environ une minute de parole —
 *  assez pour attraper « orteil » ou « poignet », pas assez pour ramasser le
 *  sujet d'avant. */
const CONTEXTE_C = 600;

/** Les deux relevés à produire : d'où vient la liste, où va l'index. */
const RELEVES = [
  { nom: 'vocabulaire', lexique: 'lexique.json', sortie: 'occurrences.json' },
  { nom: 'références', lexique: 'references.json', sortie: 'occurrences-references.json' },
];

// Le corpus est lu une fois pour les deux relevés : c'est 59 Mo de sous-titres.
const corpus = lireCorpus();

/**
 * Texte continu d'une vidéo, plus la table qui rend un instant à partir d'une
 * position de caractère.
 *
 * Les segments de sous-titres font deux ou trois mots : une locution comme
 * « crête iliaque » tombe presque toujours à cheval sur deux segments. Chercher
 * segment par segment la manquerait une fois sur deux, d'où la concaténation.
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
  // Les deux textes sont pliés caractère par caractère : un offset vaut pour
  // les deux, ce qui permet de chercher dans l'un et d'horodater avec l'autre.
  return { plie, accentue, jalons };
}

function instantDe(jalons, offset) {
  // Recherche dichotomique du dernier jalon commençant avant l'offset.
  let lo = 0, hi = jalons.length - 1, r = 0;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (jalons[m].offset <= offset) { r = m; lo = m + 1; } else hi = m - 1;
  }
  return jalons[r].t;
}

const echappe = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');

/**
 * Trois motifs par terme : l'un cherché sur le texte plié, l'autre — les
 * variantes préfixées « ! » — sur le texte accentué, le troisième — celles
 * préfixées « ? » — mis en attente d'arbitrage, faute de désigner à lui seul
 * une notion : deux termes peuvent réclamer le même mot, et c'est le voisinage
 * qui tranche (voir `arbitrer`).
 *
 * La plus longue variante passe d'abord pour que « grand dorsal » gagne sur
 * « dorsal » et ne soit pas compté deux fois.
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
  const souples = terme.variantes.filter((v) => !/^[!?]/.test(v));
  return {
    souple: range(souples, false),
    strict: range(strictes, true),
    ambigu: range(ambigues, false),
    contexte: (terme.contexte ?? []).map((m) => motif(m)).filter(Boolean),
  };
}

/**
 * Combien de mots du contexte d'un terme entourent cette position.
 *
 * Le compte, et non la simple présence : quand « fléchisseur » tombe dans un
 * passage qui parle de la main et cite le pied en passant, c'est le nombre de
 * mots de chaque bord qui fait pencher.
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
 * Attribue les mentions ambiguës, une par une, au terme dont le voisinage parle
 * le plus fort. Un terme qui tient déjà la position par une locution entière l'a
 * gagnée d'avance ; une position que personne ne réclame plus fort qu'un autre
 * est abandonnée, car une mention mal rangée coûte plus cher qu'une mention
 * perdue.
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

    // Premier passage : ce que chaque terme tient par lui-même, et ce qu'il
    // réclame sans pouvoir le prouver seul.
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

    // Second passage : le voisinage tranche.
    const { gagnees, rendues, perdues } = arbitrer(plie, litiges, tenues, motsDe);
    arbitrees += rendues;
    abandonnees += perdues;

    for (const terme of lexique) {
      const offsets = [...(fermes.get(terme.id) ?? []), ...(gagnees.get(terme.id) ?? [])]
        .sort((a, b) => a - b);
      const instants = [];
      for (const off of offsets) {
        const t = Math.max(0, instantDe(jalons, off) - AMORCE_S);
        // Fusion des mentions rapprochées.
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
