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
  // Michelangelo Buonarroti, et non Michelangelo Merisi — qui est le Caravage.
  // Chercher « michelangelo » a bel et bien rendu « The Musicians » du Caravage
  // sous le nom de Michel-Ange : le prénom ne suffit pas à distinguer deux
  // peintres majeurs, il faut le patronyme.
  'michel-ange': ['Michelangelo Buonarroti', 'buonarroti'],
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

/** Levée quand le Met nous limite : on arrête tout plutôt que d'insister. */
class Limite extends Error {}

/** Rythme délibérément lent. La dernière tentative a tiré près de 1 900
 *  requêtes en quelques minutes et s'est fait couper ; la lenteur est ici une
 *  condition de réussite, pas une précaution de principe. */
const PAUSE_MS = 300;
const MAX_NOTICES = 20;

/**
 * Nombre d'artistes traités par exécution.
 *
 * Le Met coupe après quelques dizaines de requêtes quand on l'a fâché. Plutôt
 * que d'insister au sein d'une même exécution, on avance par petites salves
 * espacées : chaque passage reprend là où le précédent s'est arrêté, puisque
 * les appariements déjà au Met sont sautés et que le fichier est réécrit à
 * chaque fois.
 */
const MAX_PAR_SALVE = Number(process.env.SALVE ?? 3);

async function lire(url) {
  const r = await fetch(url);
  if (r.status === 403 || r.status === 429) throw new Limite(`le Met répond ${r.status}`);
  return r.ok ? r.json() : null;
}

/**
 * Metropolitan Museum : la recherche rend des identifiants, à ouvrir un à un.
 *
 * On le préfère à l'Art Institute pour une raison de vérifiabilité : son API
 * rend l'adresse de sa propre page dans `objectURL`, donc le lien est attesté
 * par l'institution. L'API de l'Art Institute n'expose aucune URL par objet, et
 * tout son domaine refuse les requêtes automatiques : ses liens ne peuvent être
 * ni tenus de la source, ni constatés.
 */
async function chezMet(recherche, attendu) {
  for (const parArtiste of [true, false]) {
    const params = { q: recherche, hasImages: 'true' };
    if (parArtiste) params.artistOrCulture = 'true';
    const res = await lire(
      'https://collectionapi.metmuseum.org/public/collection/v1/search?' +
        new URLSearchParams(params),
    );
    const ids = res?.objectIDs ?? [];
    const candidats = [];
    for (const id of ids.slice(0, MAX_NOTICES)) {
      await dors(PAUSE_MS);
      const d = await lire(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`,
      );
      if (!d?.isPublicDomain || !d.primaryImageSmall) continue;
      if (!acceptable(d.artistDisplayName, attendu)) continue;
      candidats.push({
        musee: 'The Metropolitan Museum of Art',
        url: d.objectURL,
        oeuvre: d.title,
        date: d.objectDate ?? null,
        artiste: d.artistDisplayName,
      });
      if (candidats.length >= 6) break;
    }
    candidats.sort((x, y) => rang(x.oeuvre) - rang(y.oeuvre));
    if (candidats[0]) return candidats[0];
  }
  return null;
}

/**
 * On repart du relevé précédent plutôt que d'une page blanche.
 *
 * La version d'avant réécrivait tout à chaque passage : une coupure de l'API en
 * cours de route remplaçait donc des liens vérifiés par des liens moins bons,
 * en silence. Ici un appariement n'est remplacé que par un meilleur, et une
 * interruption laisse le fichier tel qu'il était.
 */
const fichier = new URL('./musees.json', import.meta.url);
let trouves = {};
try {
  trouves = JSON.parse(readFileSync(fichier, 'utf8'));
} catch {
  console.log('(aucun relevé précédent)');
}

const AVANT = Object.fromEntries(Object.entries(trouves).map(([k, v]) => [k, v.musee]));
let promus = 0;
let coupe = false;
let tentes = 0;

for (const ref of references) {
  const cible = CIBLES[ref.id];
  if (!cible) continue;
  const dejaAuMet = trouves[ref.id]?.musee?.includes('Metropolitan');
  if (dejaAuMet) continue;
  if (tentes >= MAX_PAR_SALVE) break;
  tentes++;

  const [recherche, attendu] = cible;
  try {
    const r = await chezMet(recherche, attendu);
    if (r) {
      trouves[ref.id] = r;
      promus++;
      console.log(`↑ ${ref.nom.padEnd(24)} ${r.artiste} — « ${r.oeuvre.slice(0, 52)} »`);
    } else if (!trouves[ref.id]) {
      // Rien au Met et rien en réserve : on tente l'Art Institute.
      const a = await chezAic(recherche, attendu);
      if (a) {
        trouves[ref.id] = a;
        console.log(`· ${ref.nom.padEnd(24)} (Art Institute) « ${a.oeuvre.slice(0, 44)} »`);
      }
    }
  } catch (e) {
    if (e instanceof Limite) {
      console.error(`\nINTERROMPU : ${e.message}. Le relevé précédent est conservé.`);
      coupe = true;
      break;
    }
    console.error(`  ${ref.id} : ${e.message}`);
  }
  await dors(PAUSE_MS);
}

writeFileSync(fichier, JSON.stringify(trouves, null, 1) + '\n');

const compte = {};
for (const v of Object.values(trouves)) compte[v.musee] = (compte[v.musee] ?? 0) + 1;
const restants = references.filter(
  (r) => CIBLES[r.id] && !trouves[r.id]?.musee?.includes('Metropolitan'),
).length;
console.log(
  `\n${promus}/${tentes} passés au Met${coupe ? ' (coupé)' : ''} · ${restants} restent à tenter`,
);
for (const [m, n] of Object.entries(compte)) console.log(`  ${String(n).padStart(3)}  ${m}`);
const perdus = Object.keys(AVANT).filter((k) => !trouves[k]);
console.log(perdus.length ? `PERTE : ${perdus.join(', ')}` : 'aucun appariement perdu');
