/**
 * Moments où le registre du cours change : mot familier, souvenir personnel,
 * adresse directe à la salle.
 *
 * Ce ne sont pas des parenthèses dans l'enseignement, c'est l'enseignement même.
 * Debord fait cours d'une voix, pendant deux heures, sans notes : le souvenir
 * d'atelier situe une pratique, l'adresse à la salle vérifie qu'on suit, et le
 * mot cru nomme une forme sans périphrase, donc sans flou. Les regrouper ici
 * donne à lire sa manière de tenir un amphithéâtre, pas un florilège de bons
 * mots.
 *
 * Le repérage est lexical — les sous-titres ne notent aucun rire, donc aucun
 * signal automatique n'existe. Les 139 moments ont été relus un par un, et ceux
 * dont le passage était assez intelligible ont reçu une notice de deux ou trois
 * phrases, écrite pour ce site. Les autres restent de simples points d'écoute :
 * les décrire supposerait de deviner ce qu'a dit quelqu'un de réel.
 *
 * La catégorie, elle, vient du mot qui a déclenché le repérage, et se trompe
 * parfois : « figurez-vous » range en souvenir un passage qui n'en est pas un.
 * La notice dit alors ce qu'il en est, et c'est elle qu'on lit.
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
      "Debord nomme crûment ce qu'il montre. Devant un corps nu, la périphrase mettrait une gêne là où il faut un mot précis : le terme familier désigne sans détour, et le dessin suit.",
  },
  salle: {
    libelle: 'À la salle',
    propos:
      "Debord interpelle l'auditoire, le prend à témoin, annonce qu'il plaisante. C'est ainsi qu'il tient deux heures d'attention et vérifie qu'on le suit.",
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
