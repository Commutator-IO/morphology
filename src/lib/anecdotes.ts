/**
 * Moments where the course changes register: a coarse word, a personal
 * recollection, a direct address to the room.
 *
 * These are not asides in the teaching, they are the teaching. Debord lectures
 * for two hours from his voice alone, without notes: the studio memory places a
 * practice, the address to the room checks that people are following, and the
 * blunt word names a form without circumlocution, hence without vagueness.
 * Gathering them here shows how he holds a lecture hall, not a garland of
 * witticisms.
 *
 * Detection is lexical — the subtitles note no laughter, so no automatic signal
 * exists. The 139 moments were reviewed one by one, and those whose passage was
 * intelligible enough were given a two- or three-sentence note written for this
 * site. The rest stay plain listening points: describing them would mean
 * guessing what a real person said.
 *
 * The category comes from the word that triggered the match, and is sometimes
 * wrong: "figurez-vous" files as recollection a passage that is not one. The
 * note then says what it is, and the note is what one reads.
 */
import brut from '../data/anecdotes.json';
import { SEANCE_PAR_ID, type Seance } from './lexique';

export type Categorie = 'familier' | 'souvenir' | 'salle';

export type Moment = {
  video: string;
  t: number;
  mot: string;
  categorie: Categorie;
  /** Hand-written note, when the passage is intelligible enough. */
  note?: string;
  /**
   * Debord explains anatomy through something outside art — a sport, an animal,
   * an everyday gesture.
   */
  comparaison?: boolean;
};

const DONNEES = brut as { genere: string; fenetreS: number; moments: Moment[] };

export const MOMENTS = DONNEES.moments;
export const ANECDOTES_GENERE = DONNEES.genere;

export const CATEGORIES: Record<Categorie, { libelle: string; propos: string }> = {
  souvenir: {
    libelle: 'Souvenir',
    propos:
      "Debord parle à la première personne : un atelier d'autrefois, une rencontre, un maître. C'est là que le cours devient un témoignage.",
  },
  familier: {
    libelle: 'Registre familier',
    propos:
      "Debord nomme crûment ce qu'il montre. Devant un corps nu, la périphrase mettrait une gêne là où il faut un mot précis : le terme familier désigne sans détour, et le dessin suit.",
  },
  salle: {
    libelle: 'À la salle',
    propos:
      "Debord interpelle l'auditoire, le prend à témoin, annonce qu'il plaisante. C'est ainsi qu'il tient deux heures d'attention et vérifie qu'on le suit.",
  },
};

export const ORDRE: Categorie[] = ['souvenir', 'familier', 'salle'];

/** A session's moments, in course order. */
export type ParSeance = { seance: Seance; moments: Moment[] };

export function grouperParSeance(moments: Moment[]): ParSeance[] {
  const m = new Map<string, Moment[]>();
  for (const x of moments) {
    const l = m.get(x.video) ?? [];
    l.push(x);
    m.set(x.video, l);
  }
  return [...m]
    .map(([video, liste]) => ({
      seance: SEANCE_PAR_ID.get(video)!,
      moments: liste.sort((a, b) => a.t - b.t),
    }))
    .filter((x) => x.seance)
    .sort((a, b) => a.seance.rang - b.seance.rang);
}

/** Moments where anatomy is explained through something outside art. */
export const COMPARAISONS = MOMENTS.filter((m) => m.comparaison);

/** The described moments, the only ones carrying a note. */
export const DECRITS = MOMENTS.filter((m) => m.note);
