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
 * Deux motifs par terme : l'un cherché sur le texte plié, l'autre — les
 * variantes préfixées « ! » — sur le texte accentué.
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
  const souples = terme.variantes.filter((v) => !v.startsWith('!'));
  return { souple: range(souples, false), strict: range(strictes, true) };
}

function relever({ nom, lexique: fichier, sortie: fichierSortie }) {
  const lexique = JSON.parse(readFileSync(new URL(`../src/data/${fichier}`, import.meta.url)));

  const index = {}; // id du terme -> { total, videos: { videoId: [instants] } }

  for (const t of lexique) index[t.id] = { total: 0, videos: {} };

  for (const video of corpus) {
    const { plie, accentue, jalons } = aplatir(video);
    if (!jalons.length) continue;
    const trouves = [];
    for (const terme of lexique) {
      const { souple, strict } = motifsDe(terme);
      const offsets = [];
      if (souple) for (const m of plie.matchAll(souple)) offsets.push(m.index);
      if (strict) for (const m of accentue.matchAll(strict)) offsets.push(m.index);
      offsets.sort((a, b) => a - b);
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
      trouves.push(terme.id);
    }
    // `trouves` ne sert qu'au compte affiché ci-dessous : le classement des termes
    // par séance n'est pas publié, il se déduit de `termes` et le dupliquer ferait
    // 61 ko de plus à télécharger, avec deux vérités pour un même fait.
    void trouves;
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

}

for (const releve of RELEVES) relever(releve);
