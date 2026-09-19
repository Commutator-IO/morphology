/**
 * Moments où le registre du cours change : mot familier, souvenir personnel,
 * adresse directe à la salle.
 *
 * Le registre familier est bien celui du cours : un auditeur l'a confirmé à
 * l'écoute, là où la lecture des sous-titres seule ne permettait pas de
 * trancher. Ce que le relevé ne sait toujours pas faire, c'est dire ce qui se
 * dit : les sous-titres ne notent aucun rire, le repérage est purement lexical,
 * et la transcription déforme parfois le mot déclencheur — « graticule » y
 * devient « gratte-cul ». D'où des points d'écoute horodatés, et jamais une
 * qualification de ce qui s'y joue.
 */
import brut from '../data/anecdotes.json';
import { SEANCE_PAR_ID, type Seance } from './lexique';

export type Categorie = 'familier' | 'souvenir' | 'salle';

export type Moment = {
  video: string;
  t: number;
  mot: string;
  categorie: Categorie;
  /** Mot que la transcription déforme souvent : l'instant vaut, le mot est à
   *  confirmer à l'oreille. */
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
      "Debord parle crûment, et c'est bien son ton. Le mot exact, lui, est parfois inventé par la transcription — « graticule » y devient « gratte-cul » — d'où les repères marqués d'un point d'interrogation.",
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
