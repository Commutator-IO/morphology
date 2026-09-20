/**
 * Typed access to the lexicon and to the index of passages.
 *
 * The three files in `src/data/` are versioned: `lexique.json` is written by
 * hand (it is the content), `occurrences.json` and `seances.json` are
 * generated. The site recomputes nothing at display time — it could not, since
 * the transcripts are never published.
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
  /** International nomenclature, where Debord's word is no longer the atlases'
   *  — cubitus for ulna, omoplate for scapula, rotule for patella. */
  moderne?: string;
  /** Synonymes et tournures propres au cours. */
  aussi?: string[];
  definition: string;
  variantes: string[];
  /** Surrounding words that settle an ambiguous variant — those prefixed "?".
   *  "Fléchisseur" means the forearm as readily as the leg: the passage
   *  decides, and the arbitration happens at indexing time
   *  (`scripts/indexer.mjs`), never at display time. */
  contexte?: string[];
  /** Where the term sits on the body plan's silhouette, in its own
   *  coordinates. Absent for notions located nowhere — aplomb, méplat,
   *  raccourci — and for whatever is still unplaced. */
  situation?: Situation;
};

/**
 * One mark on the body plan.
 *
 * Two shapes suffice: a blob for a mass — a muscle, a short bone — and a line
 * for whatever is long and slanted, femur or sartorius. Coordinates are those
 * of the silhouette's `boite`, and the two views line up: a mark measured from
 * the front holds from the back.
 */
export type Situation = {
  vue: 'face' | 'dos';
  /** [cx, cy, rx, ry] */
  taches?: [number, number, number, number][];
  /** [x1, y1, x2, y2] */
  traits?: [number, number, number, number][];
};

export type Seance = {
  rang: number;
  id: string;
  partie: string;
  titre: string;
  titreYoutube: string;
  dureeS: number | null;
  /** The date the session was taught, from PSL's catalogue — "2002-11-19" — or
   *  the year alone for the two documents filmed in 2017. */
  date: string;
  /** Not a session of the year: the introduction and the biographical notice,
   *  filmed fourteen years later. They close the list. */
  document?: boolean;
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

/** A passage: a session, and the moment to enter it. */
export type Passage = { seance: Seance; instants: number[] };

/** A term's passages, in course order. */
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
 * The terms found in a session, most present first.
 *
 * Inverted on the fly from the per-term index rather than published as a second
 * table: the same fact stored twice always ends up diverging, and it would add
 * 61 kB to download on a phone. The inversion costs one pass, done once when
 * the module loads.
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

/** YouTube link, optionally at a given moment. */
export function lienYoutube(videoId: string, instant?: number): string {
  const base = `https://www.youtube.com/watch?v=${videoId}`;
  return instant === undefined ? base : `${base}&t=${instant}s`;
}

/** h:mm:ss, or m:ss under the hour — the form the YouTube player shows. */
export function horodate(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, '0');
  return `${h ? `${h}:` : ''}${mm}:${String(sec).padStart(2, '0')}`;
}

/** "1 h 45": a session's length reads in hours, not minutes. */
export function duree(s: number | null): string {
  if (!s) return '—';
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`;
}

/**
 * The comparison form of a string for search: lowercase, accents folded,
 * punctuation removed.
 *
 * Necessary rather than convenient: people type "deltoide" on a phone keyboard,
 * without accents and usually without the diaeresis, to find "Deltoïde". The
 * same fold the indexer uses, so on-screen search and subtitle matching behave
 * alike.
 */
export function pliage(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** The text a term is searched against: its name, its synonyms, its formal
 *  nomenclature and its collected variants. Searching "scapula" must find
 *  "Omoplate", or the index only serves those who already know. */
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
  // Every word of the query must be present: "grand dorsal" must not surface
  // everything containing "grand".
  return q.split(' ').every((mot) => cible.includes(mot));
}

/** French alphabetical order, accents ignored. */
export const parAlphabet = (a: Terme, b: Terme) =>
  a.terme.localeCompare(b.terme, 'fr', { sensitivity: 'base' });
