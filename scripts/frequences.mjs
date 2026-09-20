// Reconnaissance pass: what does the corpus actually contain?
// Used to build the lexicon from observation rather than from guesswork.
import { lireCorpus, normaliser } from './corpus.mjs';

const corpus = lireCorpus();
const texte = corpus.map((v) => v.segments.map((s) => s.texte).join(' ')).join(' ');
const mots = normaliser(texte).split(' ').filter((m) => m.length > 3);

const uni = new Map(), bi = new Map(), tri = new Map();
const compte = (m, k) => m.set(k, (m.get(k) ?? 0) + 1);
for (let i = 0; i < mots.length; i++) {
  compte(uni, mots[i]);
  if (i + 1 < mots.length) compte(bi, `${mots[i]} ${mots[i + 1]}`);
  if (i + 2 < mots.length) compte(tri, `${mots[i]} ${mots[i + 1]} ${mots[i + 2]}`);
}
const top = (m, n) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n);

const cible = process.argv[2];
if (cible) {
  const re = new RegExp(normaliser(cible));
  console.log('--- unigrammes ---');
  for (const [k, v] of [...uni].filter(([k]) => re.test(k)).sort((a,b)=>b[1]-a[1]).slice(0,40)) console.log(v, k);
  console.log('--- bigrammes ---');
  for (const [k, v] of [...bi].filter(([k]) => re.test(k)).sort((a,b)=>b[1]-a[1]).slice(0,40)) console.log(v, k);
} else {
  console.log(`vidéos ${corpus.length} · mots ${mots.length}`);
  console.log('=== TOP 120 unigrammes ===');
  console.log(top(uni, 120).map(([k, v]) => `${v} ${k}`).join('\n'));
  console.log('=== TOP 80 bigrammes ===');
  console.log(top(bi, 80).map(([k, v]) => `${v} ${k}`).join('\n'));
  console.log('=== TOP 40 trigrammes ===');
  console.log(top(tri, 40).map(([k, v]) => `${v} ${k}`).join('\n'));
}
