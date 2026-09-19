/**
 * Accès typé au lexique et à l'index des passages.
 *
 * Les trois fichiers de `src/data/` sont produits par les scripts et versionnés :
 * `lexique.json` est écrit à la main (c'est le contenu), `occurrences.json` et
 * `seances.json` sont générés. Le site ne recalcule rien à l'affichage — il ne
 * pourrait pas, les transcriptions ne sont pas publiées.
 */
import lexiqueBrut from '../data/lexique.json';
import occurrencesBrut from '../data/occurrences.json';
import seancesBrut from '../data/seances.json';
import type { Categorie } from './couleurs';

export type Terme = {
  id: string;
  terme: string;
  categorie: Categorie;
  region: string;
  /** Nomenclature internationale, quand le mot de Debord n'est plus celui des
   *  atlas — cubitus pour ulna, omoplate pour scapula, rotule pour patella. */
  moderne?: string;
  /** Synonymes et tournures propres au cours. */
  aussi?: string[];
  definition: string;
  variantes: string[];
};

export type Seance = {
  rang: number;
  id: string;
  partie: string;
  titre: string;
  titreYoutube: string;
  dureeS: number | null;
  /** Publiée sur la chaîne PSL mais absente de la playlist. Son rang est alors
   *  un numéro de rangement et non une place dans l'ordre de publication. */
  horsPlaylist?: boolean;
};

export type Partie = { id: string; titre: string; propos: string };

export const LEXIQUE = lexiqueBrut as Terme[];
export const SEANCES = seancesBrut.seances as Seance[];
export const PARTIES = seancesBrut.parties as Partie[];

const OCC = occurrencesBrut as {
  genere: string;
  fenetreS: number;
  videos: number;
  termes: Record<string, { total: number; videos: Record<string, number[]> }>;
};

export const INDEX_GENERE = OCC.genere;
export const FENETRE_S = OCC.fenetreS;

export const SEANCE_PAR_ID = new Map(SEANCES.map((s) => [s.id, s]));
export const TERME_PAR_ID = new Map(LEXIQUE.map((t) => [t.id, t]));

/** Un passage : une séance, et l'instant où l'entrer. */
export type Passage = { seance: Seance; instants: number[] };

/** Les passages d'un terme, dans l'ordre du cours. */
export function passagesDe(id: string): Passage[] {
  const e = OCC.termes[id];
  if (!e) return [];
  return Object.entries(e.videos)
    .map(([videoId, instants]) => ({ seance: SEANCE_PAR_ID.get(videoId)!, instants }))
    .filter((p) => p.seance)
    .sort((a, b) => a.seance.rang - b.seance.rang);
}

export function totalDe(id: string): number {
  return OCC.termes[id]?.total ?? 0;
}

/**
 * Les termes relevés dans une séance, du plus présent au moins présent.
 *
 * Renversé à la volée depuis l'index par terme, plutôt que publié en second
 * tableau : le même fait stocké deux fois finit toujours par diverger, et cela
 * ferait 61 ko de plus à charger sur un téléphone. Le renversement coûte un seul
 * parcours, fait une fois pour toutes au chargement du module.
 */
const PAR_SEANCE = (() => {
  const m = new Map<string, { terme: Terme; n: number }[]>();
  for (const [id, e] of Object.entries(OCC.termes)) {
    const terme = TERME_PAR_ID.get(id);
    if (!terme) continue;
    for (const [videoId, instants] of Object.entries(e.videos)) {
      const l = m.get(videoId) ?? [];
      l.push({ terme, n: instants.length });
      m.set(videoId, l);
    }
  }
  for (const l of m.values()) {
    l.sort((a, b) => b.n - a.n || a.terme.terme.localeCompare(b.terme.terme, 'fr'));
  }
  return m;
})();

export function termesDe(videoId: string): { terme: Terme; n: number }[] {
  return PAR_SEANCE.get(videoId) ?? [];
}

/** Lien YouTube, éventuellement à un instant donné. */
export function lienYoutube(videoId: string, instant?: number): string {
  const base = `https://www.youtube.com/watch?v=${videoId}`;
  return instant === undefined ? base : `${base}&t=${instant}s`;
}

/** h:mm:ss, ou m:ss sous l'heure — la forme qu'affiche le lecteur YouTube. */
export function horodate(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, '0');
  return `${h ? `${h}:` : ''}${mm}:${String(sec).padStart(2, '0')}`;
}

/** « 1 h 45 » : la durée d'une séance se lit en heures, pas en minutes. */
export function duree(s: number | null): string {
  if (!s) return '—';
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`;
}

/**
 * Forme de comparaison d'une chaîne pour la recherche : minuscules, accents
 * rabattus, ponctuation ôtée.
 *
 * Indispensable ici, et pas une commodité : on cherche « deltoide » au clavier
 * d'un téléphone, sans accent et souvent sans le tréma, pour trouver
 * « Deltoïde ». Même repli que celui de l'indexeur, pour que la recherche à
 * l'écran et le relevé dans les sous-titres se comportent pareil.
 */
export function pliage(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Texte contre lequel un terme est cherché : son nom, ses synonymes, sa
 *  nomenclature savante et ses variantes relevées. Chercher « scapula » doit
 *  trouver « Omoplate », sinon l'index ne sert qu'à ceux qui savent déjà. */
const CIBLE = new Map(
  LEXIQUE.map((t) => [
    t.id,
    pliage([t.terme, t.moderne ?? '', ...(t.aussi ?? []), ...t.variantes].join(' ')),
  ]),
);

export function correspond(t: Terme, requete: string): boolean {
  const q = pliage(requete);
  if (!q) return true;
  const cible = CIBLE.get(t.id) ?? '';
  // Tous les mots de la requête doivent être présents : « grand dorsal » ne
  // doit pas remonter tout ce qui contient « grand ».
  return q.split(' ').every((mot) => cible.includes(mot));
}

/** Tri alphabétique français, accents ignorés. */
export const parAlphabet = (a: Terme, b: Terme) =>
  a.terme.localeCompare(b.terme, 'fr', { sensitivity: 'base' });
