/**
 * Finds the moments where the register shifts: coarse language, personal
 * recollection, direct address to the room.
 *
 * Writes `src/data/anecdotes.json` — identifiers, moments, and the word that
 * triggered the match, nothing more. No transcript text leaves this script,
 * here no more than anywhere else.
 *
 * Detection is lexical: the subtitles note no laughter, so there is no
 * automatic signal for a digression. Every moment kept was reviewed one by one,
 * and those whose passage is intelligible enough were given a note written for
 * this site — `scripts/anecdotes-notes.json`, versioned separately so it can be
 * fixed without re-running the survey.
 *
 *     node scripts/anecdotes.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { lireCorpus, plier } from './corpus.mjs';

/** Words whose presence may signal a shift of register. */
const REGISTRE = {
  familier: ['cul', 'trou du cul', 'pisser', 'chier', 'couilles', 'bite', 'baiser',
    'foutre', 'putain', 'merde', 'nichons', 'penis', 'verge', 'testicules',
    'copuler', 'bordel'],
  souvenir: ['je me souviens', 'je me rappelle', 'figurez vous', 'quand j etais',
    'je vous raconte'],
  // "mon ami" announces no recollection: it is Debord addressing a student —
  // "oui mon ami", "allez-y mon ami". Reviewing the passages confirmed it
  // without exception.
  salle: ['vous allez rire', 'c est une blague', 'mon ami'],
};

/** Two mentions closer than this belong to the same moment. */
const FENETRE_S = 90;
const AMORCE_S = 6;

const categorieDe = (mot) =>
  Object.entries(REGISTRE).find(([, mots]) => mots.includes(mot))?.[0] ?? 'familier';

/**
 * Moments where Debord explains anatomy through something outside art: a sport,
 * an animal, an everyday gesture, an illness. A vein of its own — it tells
 * nothing of his life, it serves the demonstration — and worth filtering for.
 */
const COMPARAISONS = new Set([
  'H2HqbPEaxk8|1975',  // windsurfers
  'XbY3hwY4Rbk|3012',  // volleyball players
  'LxhM7KErZas|5629',  // Strasbourg-Paris walker
  'Nha5ZI8PVo0|1132',  // football, shin guards
  'T3rO2WO_y7s|1880',  // football, shin guards
  '17Doi4NAYY0|1141',  // archery
  'qGdHRpt1qns|1190',  // archery
  'BySad1olbq4|3049',  // the horse
  'WMJZHTZ3LZY|5650',  // animal anatomy plates
  'Nha5ZI8PVo0|3753',  // the mare
  'lPiLzxL9qk4|1141',  // the cat
  'pA9J6JWr0CQ|4192',  // the cat
  '7wpyHczLt9Q|3843',  // bodybuilding
  'IDr53Cr4fsU|4676',  // the corset
  'ycr4a1eAkn0|2820',  // bound feet
  '17Doi4NAYY0|827',   // the hammer
  'bLQCuSOB8tA|4836',  // mumps
  'T3rO2WO_y7s|585',   // polio
  'LxhM7KErZas|669',   // the intramuscular injection
]);

/** Hand-written notes, one per intelligible moment. */
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
  // A note matching no moment any more means the survey moved under it:
  // better to hear about it than to lose the note in silence.
  console.error(`ATTENTION : ${orphelines.length} notice(s) sans moment : ${orphelines.join(', ')}`);
}
