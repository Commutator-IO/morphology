/**
 * Verse les appariements de `musees.json` dans `src/data/references.json`.
 *
 * Séparé du relevé pour être rejouable : le relevé avance par salves espacées
 * sur plusieurs heures, et la fusion doit pouvoir être relancée après chacune
 * sans rien recalculer.
 *
 *     node scripts/fusion-musees.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

/**
 * Sites d'institution, pour les entrées « lieu ».
 *
 * Vérifiés un par un en ouvrant la page et en relevant son titre : la plupart
 * des musées répondent 403 à une requête automatique, si bien qu'un contrôle
 * par code HTTP ne prouverait rien.
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
