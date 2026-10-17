import donnees from '../data/conferences.json';
import occurrences from '../data/occurrences-conferences.json';
import themesJson from '../data/themes-conferences.json';

/**
 * The lectures of the École des Beaux-Arts de Paris, digitised by PSL.
 *
 * The catalogue holds titles, dates and addresses only. The sound is never
 * copied: the player reads it from Bibnum, which owns it, and every lecture
 * links back to its record there.
 */
export type Conference = {
  /** The ark of the Bibnum record, e.g. "2nhq0". */
  id: string;
  titre: string;
  /** ISO day, or a bare year when the record gives no more. */
  date: string;
  dureeS: number;
  /** Path of the sound file under Bibnum's IIIF endpoint. */
  mp3: string;
};

export const CONFERENCES: Conference[] = donnees.conferences;

const BIBNUM = 'https://bibnum.explore.psl.eu';

export const COLLECTION = `${BIBNUM}/s/psl/ark:/18469/2ngsc`;

export const lienNotice = (c: Conference) => `${BIBNUM}/s/psl/ark:/18469/${c.id}`;

export const lienMp3 = (c: Conference) => `${BIBNUM}/iiif/3/${c.mp3}`;

const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

/** "6 octobre 1996", "octobre 1996" or "1996", as far as the record goes. */
export function dateLongue(iso: string): string {
  const [a, m, j] = iso.split('-');
  if (!m) return a;
  if (!j) return `${MOIS[Number(m) - 1]} ${a}`;
  return `${Number(j)} ${MOIS[Number(m) - 1]} ${a}`;
}

export const annee = (c: Conference): string => c.date.slice(0, 4) || 'Sans date';

/** "1 h 07" or "38 min". */
export function duree(s: number): string {
  const min = Math.round(s / 60);
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;
}

/** Lowercase, accents folded: what a search compares. */
export const plier = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** "#2nhq0@754" opens that lecture 754 seconds in. */
export function lireAncre(hash: string): { id: string; instant: number } | null {
  const m = hash.match(/^#(\w+)(?:@(\d+))?$/);
  return m ? { id: m[1], instant: Number(m[2] ?? 0) } : null;
}

// ---- Themes -----------------------------------------------------------------
//
// The index is derived from transcripts that are not published: it holds ids,
// counts and moments, never a word of what was said.

type Releve = { total: number; videos: Record<string, number[]> };

const RELEVES = (occurrences as unknown as { termes: Record<string, Releve> }).termes;

export type GroupeTheme = 'pratiques' | 'notions' | 'circuit';

export type Theme = { id: string; terme: string; groupe: GroupeTheme };

export const THEMES = themesJson as unknown as Theme[];

export const GROUPES_THEMES: { id: GroupeTheme; libelle: string }[] = [
  { id: 'pratiques', libelle: 'Pratiques' },
  { id: 'notions', libelle: 'Notions' },
  { id: 'circuit', libelle: "Le monde de l'art" },
];

const PAR_ID = new Map(CONFERENCES.map((c) => [c.id, c]));

/** Lectures with at least one marked passage, in any theme. */
export const REPEREES = new Set(
  Object.values(RELEVES).flatMap((t) => Object.keys(t.videos)),
);

/** Marked passages, all themes together. */
export const TOTAL_PASSAGES = Object.values(RELEVES).reduce((s, t) => s + t.total, 0);

export const nombreDeConferences = (theme: string): number =>
  Object.keys(RELEVES[theme]?.videos ?? {}).length;

/** The lectures where a theme comes up, the most present first. */
export function passagesDe(theme: string): { conference: Conference; instants: number[] }[] {
  return Object.entries(RELEVES[theme]?.videos ?? {})
    .flatMap(([id, instants]) => {
      const conference = PAR_ID.get(id);
      return conference ? [{ conference, instants }] : [];
    })
    .sort((a, b) => b.instants.length - a.instants.length);
}

/** "754" -> "12:34", "3725" -> "1:02:05". */
export function horodatage(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}
