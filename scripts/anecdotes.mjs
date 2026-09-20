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

/**
 * Moments dropped after listening, with the reason.
 *
 * Two kinds. Some are not the word at all: the ASR writes "cul vital" for
 * cubital antérieur, "cul boyle" for cuboïde, "penis du cou" for peauciers du
 * cou — the detection fires on a sound, not on speech. The others are a short
 * oath in passing, with no teaching in them: losing one's notes, a remark on a
 * photograph. The coarse word stays wherever it names a form, which is what it
 * is doing most of the time here.
 */
const ECARTES = new Set([
  'FHeKCC3ZiOU|2829',  // "cul vital anterieur" = cubital antérieur
  'T3rO2WO_y7s|3050',  // "cul boyle" = cuboïde
  'T3rO2WO_y7s|4986',  // "cul bri" = cuboïde
  '2nGLn4TKsp0|3406',  // "penis du cou" = peauciers du cou
  '-cDGU22RFqU|5930',  // "ti cul large", unintelligible
  '-cDGU22RFqU|6177',  // "gratte cul l age", unintelligible
  'bLQCuSOB8tA|280',   // "le cul parents marques", unintelligible
  '17Doi4NAYY0|1626',  // "baiser les mains", a courtesy and not the coarse sense
  'E7VxdQNu9jo|295',   // "merde j'ai oublié mes notes"
  'FeAucP4aKS8|6002',  // "des kilos de merde posés les uns sur les autres"
  'Qh-CpCTQCJ4|3497',  // "tout à sa merde", on contemporary painting
  'bLQCuSOB8tA|6433',  // "elles font pas chier"
  'LxhM7KErZas|1378',  // "coup de pied au cul"
  // "quand j'étais" without a note: neither passage is a recollection. One is
  // about the word "coronal" read years later in books, the other an aside on
  // the 1914-18 war that Debord, born in 1938, cannot be remembering.
  'oXJs2-3OAlA|2058',
  'RYcT89bug4U|5087',
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
    if (ECARTES.has(`${v.id}|${t}`)) continue;
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
const ecartOrphelin = [...ECARTES].filter((c) => {
  const [video, t] = c.split('|');
  return !corpus.some((v) => v.id === video && v.segments.some((s) => s.t - AMORCE_S === Number(t)));
});
if (ecartOrphelin.length) {
  // Same rule as the notes: a discard matching no moment means the survey moved
  // under it.
  console.error(`ATTENTION : ${ecartOrphelin.length} écart(s) sans moment : ${ecartOrphelin.join(', ')}`);
}
if (orphelines.length) {
  // A note matching no moment any more means the survey moved under it:
  // better to hear about it than to lose the note in silence.
  console.error(`ATTENTION : ${orphelines.length} notice(s) sans moment : ${orphelines.join(', ')}`);
}
