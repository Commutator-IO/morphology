/**
 * Merges the matches in `musees.json` into `src/data/references.json`.
 *
 * Kept apart from the survey so it can be replayed: the survey advances in
 * bursts spread over hours, and the merge must be re-runnable after each one
 * without recomputing anything.
 *
 *     node scripts/fusion-musees.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

/**
 * Institution websites, for the "lieu" entries.
 *
 * Checked one by one by opening the page and reading its title: most museums
 * answer 403 to an automated request, so an HTTP-code check would prove
 * nothing.
 */
const LIEUX = {
  louvre: ['Site officiel du musée du Louvre', 'https://www.louvre.fr'],
  prado: ['Museo Nacional del Prado', 'https://www.museodelprado.es'],
  orsay: ["Musée d'Orsay", 'https://www.musee-orsay.fr'],
  'petit-palais': ['Petit Palais', 'https://www.petitpalais.paris.fr'],
  sixtine: ['Musei Vaticani', 'https://www.museivaticani.va'],
  vatican: ['Musei Vaticani', 'https://www.museivaticani.va'],
};

const fichierRefs = new URL('../src/data/references.json', import.meta.url);
const references = JSON.parse(readFileSync(fichierRefs, 'utf8'));
const trouves = JSON.parse(readFileSync(new URL('./musees.json', import.meta.url), 'utf8'));

const changements = [];
for (const r of references) {
  const t = trouves[r.id];
  if (t) {
    const avant = r.musee?.url;
    r.musee = {
      nom: t.musee,
      url: t.url,
      oeuvre: t.oeuvre,
      ...(t.date ? { date: t.date } : {}),
    };
    if (avant !== t.url) changements.push(`${r.nom} → ${t.musee} « ${t.oeuvre.slice(0, 40)} »`);
  } else if (LIEUX[r.id]) {
    const [nom, url] = LIEUX[r.id];
    r.musee = { nom, url };
  }
}

writeFileSync(fichierRefs, JSON.stringify(references, null, 1) + '\n');

const compte = {};
for (const r of references) compte[r.musee?.nom ?? 'sans lien'] = (compte[r.musee?.nom ?? 'sans lien'] ?? 0) + 1;
if (changements.length) console.log('changements :\n  ' + changements.join('\n  '));
for (const [k, n] of Object.entries(compte).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)}  ${k}`);
}
