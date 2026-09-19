/**
 * Construit `src/data/seances.json` : les 45 séances, leur durée, et la partie
 * du cours à laquelle elles appartiennent.
 *
 * Les titres et durées viennent de YouTube, relevés une fois puis versionnés —
 * ils ne changent pas, et la CI n'a pas à interroger YouTube pour construire le
 * site. Pour les reprendre à la source :
 *
 *   yt-dlp --flat-playlist --print "%(id)s" "<url de la playlist>" > ids.txt
 *   yt-dlp --skip-download --print "%(id)s|%(duration)s|%(title)s" -a ids.txt
 *
 * Les deux dernières lignes ne sortent pas de cette commande. La playlist n'en
 * compte que 43, alors que le catalogue Bibnum de PSL en décrit 45 : c'est en
 * comparant les deux listes qu'on a vu manquer « Les deux membres inférieurs en
 * vue latérale » et « Le bras en vue postérieure ». Les deux sont bien publiées
 * sur la chaîne de l'Université PSL, simplement hors playlist. Elles sont donc
 * rangées en fin de liste, où leur rang ne prétend pas à un ordre de cours, et
 * marquées `horsPlaylist` pour que le site puisse le dire.
 *
 * Le découpage en parties, lui, est un choix : il suit l'ordre du raisonnement
 * de Debord — l'ensemble avant la région, la région avant le muscle — et non
 * l'ordre de publication de la playlist, qui mêle les sujets.
 */
import { readFileSync, writeFileSync } from 'node:fs';

/** Parties du cours, dans l'ordre où elles s'enchaînent. */
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

/** Séance -> partie. Clé = rang dans la liste ci-dessous (44 et 45 hors playlist). */
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

/** Publiées sur la chaîne PSL mais absentes de la playlist : leur rang est un
 *  numéro de rangement, pas une place dans l'ordre du cours. */
const HORS_PLAYLIST = new Set(['BZMmmc3HVto', 'qWn9BntEhyU']);

// id|durée|titre, un par ligne, dans l'ordre de la playlist.
const BRUT = readFileSync(new URL('./seances.txt', import.meta.url), 'utf8');

const partieDe = new Map();
for (const [partie, rangs] of Object.entries(APPARTENANCE)) {
  for (const r of rangs) partieDe.set(r, partie);
}

/** Le préfixe « J.F. Debord : » est sur presque tous les titres : le répéter dans une
 *  liste n'apporte rien et mange la largeur, précieuse sur un téléphone. */
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
