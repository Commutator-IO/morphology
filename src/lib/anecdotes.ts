/**
 * Moments où le registre du cours change : mot familier, souvenir personnel,
 * adresse directe à la salle.
 *
 * Le repérage est lexical — les sous-titres ne notent aucun rire, donc aucun
 * signal automatique n'existe. Les 133 moments ont été relus un par un, et ceux
 * dont le passage est assez intelligible ont reçu une notice de deux ou trois
 * phrases, écrite pour ce site. Les autres restent de simples points d'écoute.
 */
import brut from '../data/anecdotes.json';
import { SEANCE_PAR_ID, type Seance } from './lexique';

export type Categorie = 'familier' | 'souvenir' | 'salle';

export type Moment = {
  video: string;
  t: number;
  mot: string;
  categorie: Categorie;
  /** Notice écrite à la main, quand le passage est assez intelligible. */
  note?: string;
  /** Debord y éclaire l'anatomie par un domaine étranger à l'art — un sport,
   *  un animal, un geste ordinaire. */
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
      "Debord parle crûment, et c'est bien son ton — l'anatomie s'y prête, et il ne s'embarrasse pas de périphrases.",
  },
  salle: {
    libelle: 'À la salle',
    propos: "Debord s'adresse directement à l'auditoire et annonce qu'il plaisante.",
  },
};

export const ORDRE: Categorie[] = ['souvenir', 'familier', 'salle'];

/** Les moments d'une séance, dans l'ordre du cours. */
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

/** Les moments où l'anatomie est éclairée par un domaine étranger à l'art. */
export const COMPARAISONS = MOMENTS.filter((m) => m.comparaison);

/** Les moments décrits, seuls à porter une notice. */
export const DECRITS = MOMENTS.filter((m) => m.note);
