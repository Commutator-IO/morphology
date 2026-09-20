/**
 * Builds `src/data/seances.json`: the 45 sessions, their length, and the part
 * of the course they belong to.
 *
 * Titles and lengths come from YouTube, collected once and then versioned —
 * they do not change, and CI need not query YouTube to build the site. To
 * collect them again from source:
 *
 *   yt-dlp --flat-playlist --print "%(id)s" "<playlist url>" > ids.txt
 *   yt-dlp --skip-download --print "%(id)s|%(duration)s|%(title)s" -a ids.txt
 *
 * The last two lines do not come out of that command. The playlist holds only
 * 43, where PSL's Bibnum catalogue describes 45: comparing the two lists is how
 * "Les deux membres inférieurs en vue latérale" and "Le bras en vue
 * postérieure" turned up missing. Both are published on the Université PSL
 * channel, simply outside the playlist. They sit at the end of the list, where
 * their rank claims no place in the course order, and carry `horsPlaylist` so
 * the site can say so.
 *
 * The split into parts is a choice: it follows the order of Debord's reasoning
 * — the whole before the region, the region before the muscle — and not the
 * playlist's publication order, which mixes subjects.
 */
import { readFileSync, writeFileSync } from 'node:fs';

/** Parts of the course, in the order they follow one another. */
export const PARTIES = [
  { id: 'introduction', titre: 'Introduction',
    propos: "Ce qu'est ce cours, et qui le donne." },
  { id: 'ensemble', titre: "Vues d'ensemble et attitudes",
    propos: "La figure entière d'abord : proportions, axes, aplomb, rapport des trois masses. C'est l'ordre logique du cours, et non un préambule — un détail juste dans un ensemble faux reste faux." },
  { id: 'tronc', titre: 'Le tronc',
    propos: "Cage thoracique et bassin, les deux grands volumes dont l'orientation relative commande toute attitude." },
  { id: 'dos', titre: "Le dos et l'omoplate",
    propos: "Six séances, parce que l'omoplate glisse sur la cage sans autre attache osseuse que la clavicule : le relief du dos change à chaque mouvement du bras." },
  { id: 'epaule', titre: "L'épaule et l'embranchement du bras",
    propos: "Comment le membre supérieur se greffe sur le tronc : trois nappes musculaires qui se recouvrent, et non un raccord bout à bout." },
  { id: 'bras', titre: 'Le bras',
    propos: "Biceps, triceps, brachial antérieur — et ce que la flexion change au modelé." },
  { id: 'avantbras-main', titre: "L'avant-bras et la main",
    propos: "La région la plus travaillée du cours : deux os qui tournent l'un sur l'autre, et la main au bout." },
  { id: 'membre-inferieur', titre: 'Le membre inférieur',
    propos: "De la hanche au genou et du genou à la cheville, sous les quatre vues." },
  { id: 'pied', titre: 'Le pied',
    propos: "La voûte déduite de son empreinte au sol, puis la jambe et le pied vus de dos." },
  { id: 'tete', titre: 'La tête et le cou',
    propos: "Le crâne, les muscles peauciers, et le passage de la main au visage." },
];

/** Session -> part. Key = rank in the list below (44 and 45 are off-playlist). */
const APPARTENANCE = {
  introduction: [1, 2],
  ensemble: [3, 7, 8, 9, 10, 11, 15],
  tronc: [4, 5, 21, 22],
  dos: [23, 24, 25, 26, 27, 28],
  epaule: [6, 29, 30, 31],
  bras: [32, 33, 34, 45],
  'avantbras-main': [16, 35, 36, 37, 38, 39, 40],
  'membre-inferieur': [12, 13, 14, 19, 20, 44],
  pied: [17, 18],
  tete: [41, 42, 43],
};

/** Published on the PSL channel but missing from the playlist: their rank is a
 *  filing number, not a place in the course order. */
const HORS_PLAYLIST = new Set(['BZMmmc3HVto', 'qWn9BntEhyU']);

// id|length|title, one per line, in playlist order.
const BRUT = readFileSync(new URL('./seances.txt', import.meta.url), 'utf8');

const partieDe = new Map();
for (const [partie, rangs] of Object.entries(APPARTENANCE)) {
  for (const r of rangs) partieDe.set(r, partie);
}

/** Almost every title carries the "J.F. Debord :" prefix: repeating it in a
 *  list adds nothing and eats width, which is precious on a phone. */
function titreCourt(t) {
  return t
    .replace(/^(Cours de )?(J\.?\s?F\.?|Jean-François)\s+Debord\s*\d*\s*[:—-]?\s*/i, '')
    .replace(/^Introduction aux cours de Morphologie de Jean-François Debord aux Beaux-Arts$/,
      'Introduction au cours de morphologie')
    .replace(/^Jean-François Debord\s*:\s*/i, '')
    .trim();
}

const seances = BRUT.trim().split('\n').map((ligne, i) => {
  const [id, duree, titre] = ligne.split('|');
  const rang = i + 1;
  const partie = partieDe.get(rang);
  if (!partie) throw new Error(`séance ${rang} (${id}) n'est dans aucune partie`);
  return {
    rang,
    id,
    partie,
    titre: titreCourt(titre),
    titreYoutube: titre,
    dureeS: Number(duree) || null,
    ...(HORS_PLAYLIST.has(id) ? { horsPlaylist: true } : {}),
  };
});

const manquants = Object.values(APPARTENANCE).flat().filter((r) => r < 1 || r > seances.length);
if (manquants.length) throw new Error(`rangs inexistants : ${manquants}`);

const inconnues = [...HORS_PLAYLIST].filter((id) => !seances.some((s) => s.id === id));
if (inconnues.length) throw new Error(`hors playlist mais absentes de la liste : ${inconnues}`);

writeFileSync(
  new URL('../src/data/seances.json', import.meta.url),
  JSON.stringify({ parties: PARTIES, seances }, null, 1) + '\n',
);
console.log(`${seances.length} séances, ${PARTIES.length} parties`);
for (const p of PARTIES) {
  const n = seances.filter((s) => s.partie === p.id).length;
  const h = seances.filter((s) => s.partie === p.id).reduce((a, s) => a + (s.dureeS ?? 0), 0);
  console.log(`  ${String(n).padStart(2)} séances  ${(h / 3600).toFixed(1).padStart(5)} h  ${p.titre}`);
}
