/**
 * For each reference in the course, looks for a museum page that publicly shows
 * an image of a work — and checks that it is the right one.
 *
 * Writes `scripts/musees.json`, reviewed by hand before being merged into
 * `src/data/references.json`. The script proposes, it does not decide.
 *
 * Why go through APIs rather than URLs written from memory: an invented museum
 * address stands every chance of being plausible and wrong, and most sites
 * answer 403 to an automated request, so checking an HTTP code would prove
 * nothing. The two institutions used here publish an open API returning the
 * object's official URL, its artist, and its public-domain status: the link is
 * then observed, not assumed.
 *
 *     node scripts/musees.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const references = JSON.parse(readFileSync(new URL('../src/data/references.json', import.meta.url)));

/**
 * The name to search under, and the fragment the record must contain for a
 * match to be kept.
 *
 * The second is the guard rail: searching "David" returns anything at all, and
 * a full-text search finds an artist cited on another artist's label. So the
 * record's "artist" field is required to contain the surname.
 */
const CIBLES = {
  rembrandt: ['Rembrandt', 'rembrandt'],
  // Michelangelo Buonarroti, not Michelangelo Merisi — who is Caravaggio.
  // Searching "michelangelo" did return Caravaggio's "The Musicians" under
  // Michelangelo's name: a first name cannot tell two major painters apart,
  // only the surname can.
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
  gericault: ['Théodore Géricault', 'gericault'],
  watteau: ['Antoine Watteau', 'watteau'],
  // Dropped from the lexicon: "carpeaux" is how the ASR writes carpo- (the
  // carpometacarpal joint), "courbet" the verb courber, "poussin" a flexor of
  // the thumb. A surname colliding with the course's own vocabulary is the
  // worst kind of false friend: it surfaces exactly where the subject is
  // being taught.
  delacroix: ['Eugène Delacroix', 'delacroix'],
  schiele: ['Egon Schiele', 'schiele'],
  klimt: ['Gustav Klimt', 'klimt'],
  // "Caravaggio" is also where Polidoro Caldara and Cecco were born, so we
  // require Caravaggio's real surname, Merisi.
  caravage: ['Caravaggio Merisi', 'merisi'],
  mantegna: ['Andrea Mantegna', 'mantegna'],
  ingres: ['Ingres', 'ingres'],
  lautrec: ['Toulouse-Lautrec', 'lautrec'],
  matisse: ['Henri Matisse', 'matisse'],
  'van-gogh': ['Vincent van Gogh', 'gogh'],
  vuillard: ['Édouard Vuillard', 'vuillard'],
  bonnard: ['Pierre Bonnard', 'bonnard'],
  degas: ['Edgar Degas', 'degas'],
  cranach: ['Lucas Cranach', 'cranach'],
  manet: ['Édouard Manet', 'manet'],
  corot: ['Camille Corot', 'corot'],
  modigliani: ['Amedeo Modigliani', 'modigliani'],
  giotto: ['Giotto', 'giotto'],
  piero: ['Piero della Francesca', 'piero della francesca'],
  'fra-angelico': ['Fra Angelico', 'angelico'],
  primatice: ['Primaticcio', 'primaticcio'],
  // Antoine Masson, the 17th-century engraver, is not André Masson: the first
  // name alone tells them apart.
  masson: ['André Masson', 'andre masson'],
  miro: ['Joan Miró', 'joan mir'],
  bacon: ['Francis Bacon', 'francis bacon'],
  houdon: ['Houdon', 'houdon'],
  giacometti: ['Alberto Giacometti', 'giacometti'],
  maillol: ['Aristide Maillol', 'maillol'],
  bouchardon: ['Edme Bouchardon', 'bouchardon'],
  praxitele: ['Praxiteles', 'praxitel'],
  vesale: ['Vesalius', 'vesalius'],
  duchenne: ['Duchenne de Boulogne', 'duchenne'],
};

const dors = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Workshop and attribution wording. A first pass accepted it, so "Cecco del
 * Caravaggio" — another painter — passed for Caravaggio, and "Follower of
 * Leonardo da Vinci" for Leonardo. Sending a reader to the pupil instead of the
 * master is a substantive error in a course on the history of forms.
 */
const QUALIFICATIFS = [
  'follower of', 'workshop of', 'imitator of', 'circle of', 'attributed to',
  'after ', 'style of', 'manner of', 'school of', 'copy after', 'studio of',
  'cecco del',
];

/** A work showing a body serves a morphology course better than a landscape by
 *  the same hand: not knowing which one Debord projected, prefer the figure. */
const FIGURE = [
  'nude', 'nu ', 'figure', 'portrait', 'study', 'studies', 'anatomy', 'man',
  'woman', 'body', 'hand', 'head', 'torso', 'bust', 'académie', 'self-portrait',
];

function acceptable(artiste, attendu) {
  const a = sansAccent(artiste);
  if (!a.includes(sansAccent(attendu))) return false;
  return !QUALIFICATIFS.some((q) => a.includes(q));
}

/** A record's rank: the lower the better.
 *  Long titles are penalised — some Daumier lithographs carry their whole
 *  caption as a title, three hundred characters of it. */
function rang(titre) {
  const t = sansAccent(titre);
  const figure = FIGURE.some((m) => t.includes(sansAccent(m))) ? 0 : 2;
  const longueur = titre.length > 80 ? 1 : 0;
  return figure + longueur;
}
const sansAccent = (s) =>
  (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Art Institute of Chicago: one request returns complete records. */
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

/** Raised when the Met rate-limits us: stop everything rather than push on. */
class Limite extends Error {}

/** Deliberately slow. The previous attempt fired some 1,900 requests in a few
 *  minutes and got cut off; here slowness is a condition of success, not a
 *  precaution on principle. */
const PAUSE_MS = 300;
const MAX_NOTICES = 20;

/**
 * Artists handled per run.
 *
 * The Met cuts us off after a few dozen requests once annoyed. Rather than
 * pushing within one run, we advance in small spaced bursts: each pass resumes
 * where the last stopped, since matches already at the Met are skipped and the
 * file is rewritten every time.
 */
const MAX_PAR_SALVE = Number(process.env.SALVE ?? 3);

async function lire(url) {
  const r = await fetch(url);
  if (r.status === 403 || r.status === 429) throw new Limite(`le Met répond ${r.status}`);
  return r.ok ? r.json() : null;
}

/**
 * Metropolitan Museum: search returns identifiers, to be opened one by one.
 *
 * Preferred over the Art Institute for verifiability: its API returns the
 * address of its own page in `objectURL`, so the link comes from the
 * institution itself. The Art Institute's API exposes no per-object URL, and
 * its whole domain refuses automated requests: its links can neither be taken
 * from the source nor checked.
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
 * Start from the previous survey rather than a blank page.
 *
 * The earlier version rewrote everything on each pass, so an API cut-off
 * mid-run silently replaced verified links with worse ones. Here a match is
 * only replaced by a better one, and an interruption leaves the file as it was.
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
      // Nothing at the Met and nothing held back: try the Art Institute.
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
