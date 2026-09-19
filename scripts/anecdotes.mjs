/**
 * Repère les moments où le registre change : langage familier, souvenir
 * personnel, adresse directe à la salle.
 *
 * Écrit `src/data/anecdotes.json` — uniquement des identifiants, des instants
 * et le mot qui a déclenché le repérage. Aucun texte de transcription n'en
 * sort, ici pas plus qu'ailleurs.
 *
 * Le repérage est lexical : les sous-titres ne notent aucun rire, il n'existe
 * donc aucun signal automatique d'une digression. Les moments retenus ont été
 * relus un par un, et ceux dont le passage est assez intelligible ont reçu une
 * notice écrite pour ce site — `scripts/anecdotes-notes.json`, versionné à
 * part pour qu'on puisse la corriger sans relancer le relevé.
 *
 *     node scripts/anecdotes.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { lireCorpus, plier } from './corpus.mjs';

/** Mots dont la présence signale peut-être un écart de registre. */
const REGISTRE = {
  familier: ['cul', 'trou du cul', 'pisser', 'chier', 'couilles', 'bite', 'baiser',
    'foutre', 'putain', 'merde', 'nichons', 'penis', 'verge', 'testicules',
    'copuler', 'bordel'],
  souvenir: ['je me souviens', 'je me rappelle', 'figurez vous', 'quand j etais',
    'je vous raconte'],
  // « mon ami » n'annonce pas un souvenir : c'est Debord qui interpelle un
  // étudiant — « oui mon ami », « allez-y mon ami ». La relecture des passages
  // l'a confirmé sans exception.
  salle: ['vous allez rire', 'c est une blague', 'mon ami'],
};

/** Deux mentions séparées de moins de ça appartiennent au même moment. */
const FENETRE_S = 90;
const AMORCE_S = 6;

const categorieDe = (mot) =>
  Object.entries(REGISTRE).find(([, mots]) => mots.includes(mot))?.[0] ?? 'familier';

/**
 * Moments où Debord éclaire l'anatomie par un domaine étranger à l'art : un
 * sport, un animal, un geste ordinaire, une maladie. C'est une veine à part —
 * elle ne raconte rien de sa vie, elle sert la démonstration — et elle mérite
 * d'être filtrable pour elle-même.
 */
const COMPARAISONS = new Set([
  'H2HqbPEaxk8|1975',  // véliplanchistes
  'XbY3hwY4Rbk|3012',  // volleyeurs
  'LxhM7KErZas|5629',  // marcheur Strasbourg-Paris
  'Nha5ZI8PVo0|1132',  // football, protège-tibias
  'T3rO2WO_y7s|1880',  // football, protège-tibias
  '17Doi4NAYY0|1141',  // tir à l'arc
  'qGdHRpt1qns|1190',  // tir à l'arc
  'BySad1olbq4|3049',  // le cheval
  'WMJZHTZ3LZY|5650',  // planches d'anatomie animale
  'Nha5ZI8PVo0|3753',  // la jument
  'lPiLzxL9qk4|1141',  // le chat
  'pA9J6JWr0CQ|4192',  // le chat
  '7wpyHczLt9Q|3843',  // le culturisme
  'IDr53Cr4fsU|4676',  // le corset
  'ycr4a1eAkn0|2820',  // le pied bandé
  '17Doi4NAYY0|827',   // le marteau
  'bLQCuSOB8tA|4836',  // les oreillons
  'T3rO2WO_y7s|585',   // la poliomyélite
  'LxhM7KErZas|669',   // la piqûre intramusculaire
]);

/** Notices écrites à la main, une par moment intelligible. */
const NOTES = JSON.parse(
  readFileSync(new URL('./anecdotes-notes.json', import.meta.url), 'utf8'),
);

const corpus = lireCorpus();
const tous = Object.values(REGISTRE).flat();
const moments = [];

for (const v of corpus) {
  let dernier = -1e9;
  for (const seg of v.segments) {
    const normalise = plier(seg.texte);
    const mot = tous.find((w) =>
      new RegExp(`\\b${plier(w).replace(/ /g, '\\s+')}\\b`).test(normalise),
    );
    if (!mot) continue;
    if (seg.t - dernier < FENETRE_S) continue;
    dernier = seg.t;
    const t = Math.max(0, seg.t - AMORCE_S);
    moments.push({
      video: v.id,
      t,
      mot,
      categorie: categorieDe(mot),
      ...(NOTES[`${v.id}|${t}`] ? { note: NOTES[`${v.id}|${t}`] } : {}),
      ...(COMPARAISONS.has(`${v.id}|${t}`) ? { comparaison: true } : {}),
    });
  }
}

moments.sort((a, b) => a.video.localeCompare(b.video) || a.t - b.t);
writeFileSync(
  new URL('../src/data/anecdotes.json', import.meta.url),
  JSON.stringify({ genere: new Date().toISOString().slice(0, 10), fenetreS: FENETRE_S, moments }, null, 1) + '\n',
);

const parCat = {};
for (const m of moments) parCat[m.categorie] = (parCat[m.categorie] ?? 0) + 1;
console.log(`${moments.length} moments dans ${new Set(moments.map((m) => m.video)).size} séances`);
for (const [k, n] of Object.entries(parCat)) console.log(`  ${String(n).padStart(3)}  ${k}`);
const avecNote = moments.filter((m) => m.note).length;
console.log(`  ${avecNote} décrits, ${moments.length - avecNote} sans notice`);
console.log(`  ${moments.filter((m) => m.comparaison).length} comparaisons hors art`);
const orphelines = Object.keys(NOTES).filter(
  (c) => !moments.some((m) => `${m.video}|${m.t}` === c),
);
if (orphelines.length) {
  // Une notice qui ne correspond plus à aucun moment signale que le relevé a
  // bougé sous elle : mieux vaut le savoir que la perdre en silence.
  console.error(`ATTENTION : ${orphelines.length} notice(s) sans moment : ${orphelines.join(', ')}`);
}
