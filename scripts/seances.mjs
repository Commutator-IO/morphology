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

/** Session -> part, keyed by video id: the rank now comes from the catalogue's
 *  chronology and no longer from this file's order. */
const APPARTENANCE = {
  'introduction': ['S8fgBEKLUiM', 'qHKK0vp86-Q'],
  'ensemble': ['Qh-CpCTQCJ4', 'bLQCuSOB8tA', 'IIjBn3C3d5g', 'FeAucP4aKS8', 'BySad1olbq4', 'Nha5ZI8PVo0', 'LHaB3iu4zIw'],
  'tronc': ['vI5qC_JpkHs', 'Um8OTTlH5XQ', '2nGLn4TKsp0', 'SQyL88Fq76o'],
  'dos': ['FuwzDJ5NU5M', 'E7VxdQNu9jo', 'IDr53Cr4fsU', 'lPiLzxL9qk4', 'N32pB-1QXS0', 'XbY3hwY4Rbk'],
  'epaule': ['H2HqbPEaxk8', 'WMJZHTZ3LZY', 'xPRzam0rqDw', 'pA9J6JWr0CQ'],
  'bras': ['oXJs2-3OAlA', 'uagciNFijmY', '17Doi4NAYY0', 'qWn9BntEhyU'],
  'avantbras-main': ['68R-oaodzTg', 'qGdHRpt1qns', 'UUJWGz3BuY4', 'RYcT89bug4U', 'FHeKCC3ZiOU', '65d7NtvHAk0', '-Tss3qgdhW4'],
  'membre-inferieur': ['-cDGU22RFqU', 'ycr4a1eAkn0', 'LxhM7KErZas', 'ndTYL4boSgE', '0IO_ymdbLPU', 'BZMmmc3HVto'],
  'pied': ['T3rO2WO_y7s', '7wpyHczLt9Q'],
  'tete': ['ZdgpRuXGY40', 'kc2e56cun8U', '4IIUE6NVqDU'],
};

/**
 * The date of each session, and the order the Bibnum catalogue lists them in.
 *
 * The playlist's order is not the course's: it opens on the whole-figure
 * sessions of April and May 2003 and closes on the foot, which was taught first,
 * in November 2002. PSL's catalogue dates every session, so the rank follows it.
 *
 * Two dates fall on 28 November 2002 and the catalogue lists them in an order
 * its own sort does not explain; on a tie we keep the catalogue's order.
 *
 * The last two items are not sessions of that year but documents filmed in 2017,
 * the introduction and the biographical notice. They close the list and carry
 * `document`.
 */
const DATES = {
  'S8fgBEKLUiM': '2017',
  'qHKK0vp86-Q': '2017',
  'Qh-CpCTQCJ4': '2003-03-25',
  'vI5qC_JpkHs': '2003-03-27',
  'Um8OTTlH5XQ': '2003-04-01',
  'H2HqbPEaxk8': '2003-04-03',
  'bLQCuSOB8tA': '2003-04-22',
  'IIjBn3C3d5g': '2003-04-24',
  'FeAucP4aKS8': '2003-04-29',
  'BySad1olbq4': '2003-05-06',
  'Nha5ZI8PVo0': '2003-05-13',
  '-cDGU22RFqU': '2003-05-15',
  'ycr4a1eAkn0': '2003-05-20',
  'LxhM7KErZas': '2003-05-22',
  'LHaB3iu4zIw': '2003-05-27',
  '68R-oaodzTg': '2003-02-25',
  'T3rO2WO_y7s': '2002-11-19',
  '7wpyHczLt9Q': '2002-11-28',
  'ndTYL4boSgE': '2002-11-28',
  '0IO_ymdbLPU': '2002-12-02',
  '2nGLn4TKsp0': '2002-12-10',
  'SQyL88Fq76o': '2002-12-12',
  'FuwzDJ5NU5M': '2002-12-17',
  'E7VxdQNu9jo': '2002-12-19',
  'IDr53Cr4fsU': '2003-01-07',
  'lPiLzxL9qk4': '2003-01-14',
  'N32pB-1QXS0': '2003-01-09',
  'XbY3hwY4Rbk': '2003-01-16',
  'WMJZHTZ3LZY': '2003-01-23',
  'xPRzam0rqDw': '2003-01-28',
  'pA9J6JWr0CQ': '2003-01-30',
  'oXJs2-3OAlA': '2003-02-04',
  'uagciNFijmY': '2003-02-06',
  '17Doi4NAYY0': '2003-02-11',
  'qGdHRpt1qns': '2003-02-13',
  'UUJWGz3BuY4': '2003-02-18',
  'RYcT89bug4U': '2003-02-20',
  'FHeKCC3ZiOU': '2003-03-04',
  '65d7NtvHAk0': '2003-03-06',
  '-Tss3qgdhW4': '2003-03-11',
  'ZdgpRuXGY40': '2003-03-13',
  'kc2e56cun8U': '2003-03-18',
  '4IIUE6NVqDU': '2003-03-20',
  'BZMmmc3HVto': '2002-11-26',
  'qWn9BntEhyU': '2003-01-21',
};

const ORDRE_CATALOGUE = [
  'T3rO2WO_y7s',
  '7wpyHczLt9Q',
  'BZMmmc3HVto',
  'ndTYL4boSgE',
  '0IO_ymdbLPU',
  '2nGLn4TKsp0',
  'SQyL88Fq76o',
  'FuwzDJ5NU5M',
  'E7VxdQNu9jo',
  'IDr53Cr4fsU',
  'N32pB-1QXS0',
  'lPiLzxL9qk4',
  'XbY3hwY4Rbk',
  'qWn9BntEhyU',
  'WMJZHTZ3LZY',
  'xPRzam0rqDw',
  'pA9J6JWr0CQ',
  'oXJs2-3OAlA',
  'uagciNFijmY',
  '17Doi4NAYY0',
  'qGdHRpt1qns',
  'UUJWGz3BuY4',
  'RYcT89bug4U',
  '68R-oaodzTg',
  'FHeKCC3ZiOU',
  '65d7NtvHAk0',
  '-Tss3qgdhW4',
  'ZdgpRuXGY40',
  'kc2e56cun8U',
  '4IIUE6NVqDU',
  'Qh-CpCTQCJ4',
  'vI5qC_JpkHs',
  'Um8OTTlH5XQ',
  'H2HqbPEaxk8',
  'bLQCuSOB8tA',
  'IIjBn3C3d5g',
  'FeAucP4aKS8',
  'BySad1olbq4',
  'Nha5ZI8PVo0',
  '-cDGU22RFqU',
  'ycr4a1eAkn0',
  'LxhM7KErZas',
  'LHaB3iu4zIw',
  'S8fgBEKLUiM',
  'qHKK0vp86-Q',
];

// id|length|title, one per line, in playlist order.
const BRUT = readFileSync(new URL('./seances.txt', import.meta.url), 'utf8');

const partieDe = new Map();
for (const [partie, ids] of Object.entries(APPARTENANCE)) {
  for (const id of ids) partieDe.set(id, partie);
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

const seances = BRUT.trim()
  .split('\n')
  .map((ligne) => {
    const [id, duree, titre] = ligne.split('|');
    const partie = partieDe.get(id);
    if (!partie) throw new Error(`séance ${id} n'est dans aucune partie`);
    const date = DATES[id];
    if (!date) throw new Error(`séance ${id} sans date au catalogue`);
    return {
      id,
      partie,
      titre: titreCourt(titre),
      titreYoutube: titre,
      dureeS: Number(duree) || null,
      date,
      ...(date === '2017' ? { document: true } : {}),
    };
  })
  .sort((a, b) => {
    if ((a.date === '2017') !== (b.date === '2017')) return a.date === '2017' ? 1 : -1;
    return a.date.localeCompare(b.date) || ORDRE_CATALOGUE.indexOf(a.id) - ORDRE_CATALOGUE.indexOf(b.id);
  })
  .map((s, i) => ({ rang: i + 1, ...s }));

const inconnues = Object.values(APPARTENANCE)
  .flat()
  .filter((id) => !seances.some((s) => s.id === id));
if (inconnues.length) throw new Error(`rangées dans une partie mais absentes de la liste : ${inconnues}`);

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
