/**
 * Moments où le registre du cours change : mot familier, souvenir personnel,
 * adresse directe à la salle.
 *
 * Ce relevé est **non vérifié**, et la page le dit. Les sous-titres ne notent
 * aucun rire, donc aucun signal objectif de plaisanterie n'existe ; le repérage
 * est lexical, et la reconnaissance vocale fabrique régulièrement des mots crus
 * là où Debord dit tout autre chose. Ce sont donc des points d'écoute, jamais
 * une qualification de ce qui s'y dit.
 */
import brut from '../data/anecdotes.json';
import { SEANCE_PAR_ID, type Seance } from './lexique';

export type Categorie = 'familier' | 'souvenir' | 'salle';

export type Moment = {
  video: string;
  t: number;
  mot: string;
  categorie: Categorie;
  /** Mot que la relecture a montré trompeur presque à chaque fois. */
  douteux?: boolean;
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
      "Un mot cru a été repéré. Souvent c'est la transcription qui l'invente — « graticule » devient « gratte-cul » — d'où les repères signalés comme douteux.",
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
