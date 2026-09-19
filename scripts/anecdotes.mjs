/**
 * Repère les moments où le registre change : langage familier, souvenir
 * personnel, adresse directe à la salle.
 *
 * Écrit `src/data/anecdotes.json` — uniquement des identifiants, des instants
 * et le mot qui a déclenché le repérage. Aucun texte de transcription n'en
 * sort, ici pas plus qu'ailleurs.
 *
 * Ce relevé n'est pas vérifié, et il ne peut pas l'être automatiquement : les
 * sous-titres ne notent aucun rire — seulement de la musique et des
 * applaudissements — si bien qu'il n'existe aucun signal objectif de
 * plaisanterie. Le repérage lexical, lui, se trompe souvent : « graticule »
 * devient « gratte-cul » sous la reconnaissance vocale, et un terme anatomique
 * devient tout autre chose. D'où le drapeau `douteux`, et d'où le fait que la
 * page publie des points d'écoute et jamais une qualification.
 *
 *     node scripts/anecdotes.mjs
 */
import { writeFileSync } from 'node:fs';
import { lireCorpus, plier } from './corpus.mjs';

/** Mots dont la présence signale peut-être un écart de registre. */
const REGISTRE = {
  familier: ['cul', 'trou du cul', 'pisser', 'chier', 'couilles', 'bite', 'baiser',
    'foutre', 'putain', 'merde', 'nichons', 'penis', 'verge', 'testicules',
    'copuler', 'bordel'],
  souvenir: ['je me souviens', 'je me rappelle', 'figurez vous', 'quand j etais',
    'mon ami', 'je vous raconte'],
  salle: ['vous allez rire', 'c est une blague'],
};

/**
 * Mots que la relecture a montrés trompeurs presque à chaque fois.
 *
 * Ils restent au relevé pour qu'on puisse aller écouter, mais sont signalés :
 * les publier sans réserve reviendrait à prêter à quelqu'un des propos que la
 * transcription a inventés.
 */
const DOUTEUX = new Set(['cul', 'penis', 'verge', 'testicules', 'copuler', 'bordel']);

/** Deux mentions séparées de moins de ça appartiennent au même moment. */
const FENETRE_S = 90;
const AMORCE_S = 6;

const categorieDe = (mot) =>
  Object.entries(REGISTRE).find(([, mots]) => mots.includes(mot))?.[0] ?? 'familier';

const corpus = lireCorpus();
const tous = Object.values(REGISTRE).flat();
const moments = [];

for (const v of corpus) {
  let dernier = -1e9;
  for (const seg of v.segments) {
    const t = plier(seg.texte);
    const mot = tous.find((w) =>
      new RegExp(`\\b${plier(w).replace(/ /g, '\\s+')}\\b`).test(t),
    );
    if (!mot) continue;
    if (seg.t - dernier < FENETRE_S) continue;
    dernier = seg.t;
    moments.push({
      video: v.id,
      t: Math.max(0, seg.t - AMORCE_S),
      mot,
      categorie: categorieDe(mot),
      ...(DOUTEUX.has(mot) ? { douteux: true } : {}),
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
console.log(`  ${moments.filter((m) => m.douteux).length} signalés douteux`);
