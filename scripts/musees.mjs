/**
 * Cherche, pour chaque référence du cours, une page de musée qui diffuse
 * publiquement l'image d'une œuvre — et vérifie que c'est bien la bonne.
 *
 * Écrit `scripts/musees.json`, relu ensuite à la main avant d'être versé dans
 * `src/data/references.json`. Le script propose, il ne décide pas.
 *
 * Pourquoi passer par des API plutôt que par des URL écrites de mémoire : une
 * adresse de musée inventée a toutes les chances d'être plausible et fausse, et
 * la plupart des sites répondent 403 à une requête automatique — un contrôle par
 * simple code HTTP ne prouverait donc rien. Les deux institutions retenues
 * publient une API ouverte qui rend l'URL officielle de l'objet, son autrice ou
 * auteur, et son statut de domaine public : le lien est alors constaté, pas
 * supposé.
 *
 *     node scripts/musees.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const references = JSON.parse(readFileSync(new URL('../src/data/references.json', import.meta.url)));

/**
 * Nom sous lequel chercher, et fragment que la notice doit contenir pour que
 * l'appariement soit retenu.
 *
 * Le second est le garde-fou : chercher « David » rend n'importe quoi, et une
 * recherche plein texte trouve un artiste cité dans le cartel d'une œuvre d'un
 * autre. On exige donc que le champ « artiste » de la notice contienne le
 * patronyme.
 */
const CIBLES = {
  rembrandt: ['Rembrandt', 'rembrandt'],
  'michel-ange': ['Michelangelo', 'michelangelo'],
  leonard: ['Leonardo da Vinci', 'leonardo'],
  goya: ['Goya', 'goya'],
  veronese: ['Paolo Veronese', 'veronese'],
  velasquez: ['Velázquez', 'velazquez'],
  david: ['Jacques Louis David', 'jacques louis david'],
  daumier: ['Honoré Daumier', 'daumier'],
  tintoret: ['Tintoretto', 'tintoretto'],
  rubens: ['Peter Paul Rubens', 'rubens'],
  titien: ['Titian', 'titian'],
  picasso: ['Pablo Picasso', 'picasso'],
  raphael: ['Raphael', 'raphael'],
  delacroix: ['Eugène Delacroix', 'delacroix'],
  schiele: ['Egon Schiele', 'schiele'],
  klimt: ['Gustav Klimt', 'klimt'],
  // « Caravaggio » est aussi le lieu de naissance de Polidoro Caldara et de
  // Cecco : on exige le vrai patronyme du Caravage, Merisi.
  caravage: ['Caravaggio Merisi', 'merisi'],
  mantegna: ['Andrea Mantegna', 'mantegna'],
  ingres: ['Ingres', 'ingres'],
  courbet: ['Gustave Courbet', 'courbet'],
  lautrec: ['Toulouse-Lautrec', 'lautrec'],
  matisse: ['Henri Matisse', 'matisse'],
  'van-gogh': ['Vincent van Gogh', 'gogh'],
  vuillard: ['Édouard Vuillard', 'vuillard'],
  bonnard: ['Pierre Bonnard', 'bonnard'],
  degas: ['Edgar Degas', 'degas'],
  cranach: ['Lucas Cranach', 'cranach'],
  manet: ['Édouard Manet', 'manet'],
  bronzino: ['Bronzino', 'bronzino'],
  poussin: ['Nicolas Poussin', 'poussin'],
  corot: ['Camille Corot', 'corot'],
  modigliani: ['Amedeo Modigliani', 'modigliani'],
  giotto: ['Giotto', 'giotto'],
  piero: ['Piero della Francesca', 'piero della francesca'],
  'fra-angelico': ['Fra Angelico', 'angelico'],
  primatice: ['Primaticcio', 'primaticcio'],
  // Antoine Masson, graveur du XVIIe, n'est pas André Masson : le prénom
  // fait seul la différence.
  masson: ['André Masson', 'andre masson'],
  miro: ['Joan Miró', 'joan mir'],
  bacon: ['Francis Bacon', 'francis bacon'],
  houdon: ['Houdon', 'houdon'],
  giacometti: ['Alberto Giacometti', 'giacometti'],
  carpeaux: ['Carpeaux', 'carpeaux'],
  maillol: ['Aristide Maillol', 'maillol'],
  bouchardon: ['Edme Bouchardon', 'bouchardon'],
  praxitele: ['Praxiteles', 'praxitel'],
  vesale: ['Vesalius', 'vesalius'],
  duchenne: ['Duchenne de Boulogne', 'duchenne'],
};

const dors = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Mentions d'atelier ou d'attribution. Un premier jet les acceptait, faute de
 * quoi « Cecco del Caravaggio » — un autre peintre — passait pour le Caravage,
 * et « Follower of Leonardo da Vinci » pour Léonard. Renvoyer un élève à la
 * place du maître est une erreur de fond dans un cours d'histoire des formes.
 */
const QUALIFICATIFS = [
  'follower of', 'workshop of', 'imitator of', 'circle of', 'attributed to',
  'after ', 'style of', 'manner of', 'school of', 'copy after', 'studio of',
  'cecco del',
];

/** Une œuvre qui montre un corps sert mieux un cours de morphologie qu'un
 *  paysage du même auteur : à défaut de savoir laquelle Debord projetait, on
 *  privilégie la figure. */
const FIGURE = [
  'nude', 'nu ', 'figure', 'portrait', 'study', 'studies', 'anatomy', 'man',
  'woman', 'body', 'hand', 'head', 'torso', 'bust', 'académie', 'self-portrait',
];

function acceptable(artiste, attendu) {
  const a = sansAccent(artiste);
  if (!a.includes(sansAccent(attendu))) return false;
  return !QUALIFICATIFS.some((q) => a.includes(q));
}

/** Rang d'une notice : plus c'est bas, mieux ça vaut.
 *  Le titre long est pénalisé — certaines lithographies de Daumier portent leur
 *  légende entière en guise de titre, trois cents caractères durant. */
function rang(titre) {
  const t = sansAccent(titre);
  const figure = FIGURE.some((m) => t.includes(sansAccent(m))) ? 0 : 2;
  const longueur = titre.length > 80 ? 1 : 0;
  return figure + longueur;
}
const sansAccent = (s) =>
  (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Art Institute of Chicago : une seule requête rend des notices complètes. */
async function chezAic(recherche, attendu) {
  const url =
    'https://api.artic.edu/api/v1/artworks/search?' +
    new URLSearchParams({
      q: recherche,
      fields: 'id,title,artist_title,date_display,is_public_domain,image_id',
      limit: '60',
    });
  const r = await fetch(url);
  if (!r.ok) return null;
  const { data = [] } = await r.json();
  const candidats = data
    .filter((a) => a.is_public_domain && a.image_id && acceptable(a.artist_title, attendu))
    .sort((x, y) => rang(x.title) - rang(y.title));
  const bon = candidats[0];
  if (!bon) return null;
  return {
    musee: 'Art Institute of Chicago',
    url: `https://www.artic.edu/artworks/${bon.id}`,
    oeuvre: bon.title,
    date: bon.date_display ?? null,
    artiste: bon.artist_title,
  };
}

/** Metropolitan Museum : la recherche rend des identifiants, à ouvrir un à un. */
async function chezMet(recherche, attendu) {
  const url =
    'https://collectionapi.metmuseum.org/public/collection/v1/search?' +
    new URLSearchParams({ q: recherche, hasImages: 'true', artistOrCulture: 'true' });
  const r = await fetch(url);
  if (!r.ok) return null;
  const { objectIDs } = await r.json();
  for (const id of (objectIDs ?? []).slice(0, 12)) {
    await dors(120);
    const o = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`,
    );
    if (!o.ok) continue;
    const d = await o.json();
    if (!d.isPublicDomain || !d.primaryImageSmall) continue;
    if (!acceptable(d.artistDisplayName, attendu)) continue;
    return {
      musee: 'The Metropolitan Museum of Art',
      url: d.objectURL,
      oeuvre: d.title,
      date: d.objectDate ?? null,
      artiste: d.artistDisplayName,
    };
  }
  return null;
}

const trouves = {};
const manques = [];
for (const ref of references) {
  const cible = CIBLES[ref.id];
  if (!cible) continue;
  const [recherche, attendu] = cible;
  let r = null;
  try {
    r = (await chezAic(recherche, attendu)) ?? (await chezMet(recherche, attendu));
  } catch (e) {
    console.error(`  ${ref.id} : ${e.message}`);
  }
  if (r) {
    trouves[ref.id] = r;
    console.log(`✓ ${ref.nom.padEnd(26)} ${r.artiste} — « ${r.oeuvre} » (${r.musee})`);
  } else {
    manques.push(ref.nom);
    console.log(`· ${ref.nom.padEnd(26)} aucune correspondance sûre`);
  }
  await dors(150);
}

writeFileSync(new URL('./musees.json', import.meta.url), JSON.stringify(trouves, null, 1) + '\n');
console.log(`\n${Object.keys(trouves).length} appariements, ${manques.length} sans correspondance`);
if (manques.length) console.log('sans : ' + manques.join(', '));
