/**
 * What comes before the course and what comes out of it: the chair of artistic
 * anatomy before Debord, and those he trained.
 *
 * Two kinds of heir: those who wrote morphology in their turn, and those who
 * practise it without having published anything. The second have no
 * bibliography, but leaving them out would misrepresent what the course
 * produced — teaching drawing is judged first on draughtsmen.
 *
 * Every entry carries its source. That is the site's rule: nothing is cited
 * from memory, and whatever could not be checked says so.
 */
import brut from '../data/lignee.json';

export type Role = 'avant' | 'sources' | 'lui' | 'apres' | 'artistes' | 'autour';

export type Ouvrage = {
  titre: string;
  editeur?: string;
  annee?: string;
  /** Freely readable digitisation, where one exists. */
  url?: string;
};

export type Figure = {
  id: string;
  nom: string;
  dates?: string;
  /**
   * Year of birth, where it could be verified. Without it the figure keeps its
   * card but is left off the timeline: better absent than wrongly dated.
   */
  ne?: number;
  /** Year of death; absent for the living. */
  mort?: number;
  role: Role;
  notice: string;
  ouvrages: Ouvrage[];
  /**
   * Instagram handle, where the account could be authenticated — the bio or a
   * post had to name the person and their trade. Absent rather than guessed:
   * pointing at a namesake would be worse than nothing.
   */
  instagram?: string;
  /**
   * Portrait linked from Wikimedia Commons, never rehosted, and only when the
   * file is public domain or freely licensed. For the living there are none:
   * their plate shows initials rather than a face nobody may publish.
   */
  portrait?: string;
  /**
   * Reframing of the plate when the free file is not a portrait: anchor point
   * (object-position) and zoom factor.
   */
  cadrage?: { position: string; zoom?: number };
  /**
   * Moments in the course where Debord speaks of this person.
   *
   * Plural: Pol Le Cœur is cited in six sessions, and keeping only one would be
   * arbitrary. It is the most direct source the page can offer — not a note about
   * him, but his own voice.
   */
  ecoutes?: { video: string; t: number; seance: number; horodate: string; propos: string }[];
  /** Dated steps of a career, for the timeline inside the card. */
  jalons?: { annee: number; fait: string }[];
  /** Videos or pages where the person speaks for themselves. */
  liens?: { url: string; libelle: string; propos?: string }[];
  source: string;
};

export const FIGURES = brut as Figure[];

export const SECTIONS: { role: Role; titre: string; propos: string }[] = [
  {
    role: 'sources',
    titre: 'Les livres sur sa table',
    propos:
      "Les auteurs qu'il ouvre en cours — ceux qui ont fait l'anatomie avant qu'elle ne devienne un enseignement de dessin. Il ne les commente pas : il s'en sert, et les corrige quand le vivant le contredit. Aucun d'eux n'est placé sur la frise, qui tient en deux générations ; on les retrouve en bas de page, dans le temps long.",
  },
  {
    role: 'avant',
    titre: 'Ses maîtres',
    propos:
      "Les traités sur lesquels l'enseignement français de la morphologie s'est bâti, et les hommes dont Debord fut l'assistant. Il s'appuie sur les premiers et les corrige d'après le vivant, souvent dans la même phrase.",
  },
  {
    role: 'lui',
    titre: 'Lui',
    propos: "Le cours indexé par ce site est la captation de sa dernière année d'enseignement.",
  },
  {
    role: 'apres',
    titre: "Ceux qu'il a formés",
    propos:
      "Des élèves qui ont écrit à leur tour, et porté la discipline ailleurs — vers le carnet de dessin, vers le geste sportif.",
  },
  {
    role: 'artistes',
    titre: "Les artistes qu'il a formés",
    propos:
      "Ceux qui n'ont pas écrit sur la morphologie mais en vivent le résultat. La bande dessinée y tient une place particulière : c'est un métier où l'on dessine le corps de mémoire, mille fois, sans modèle devant soi — exactement ce que ce cours prépare.",
  },
  {
    role: 'autour',
    titre: 'Autour du cours',
    propos:
      "Un collègue de la même maison, et le seul livre tiré du cours lui-même.",
  },
];

export const parSection = (role: Role) => FIGURES.filter((f) => f.role === role);

/** Figures placed on the timeline: those whose birth year is established. */
export const DATEES = FIGURES.filter((f) => f.ne).sort((a, b) => a.ne! - b.ne!);

/** A life's end year on the timeline — the current year for the living. */
export function finDe(f: Figure): number {
  return f.mort ?? new Date().getFullYear();
}

/** Scale bounds, rounded to the quarter century either side. */
export const ECHELLE = (() => {
  const debut = Math.floor(Math.min(...DATEES.map((f) => f.ne!)) / 25) * 25;
  const fin = Math.ceil(Math.max(...DATEES.map(finDe)) / 25) * 25;
  const reperes: number[] = [];
  for (let a = debut; a <= fin; a += 25) reperes.push(a);
  return { debut, fin, reperes, place: (a: number) => ((a - debut) / (fin - debut)) * 100 };
})();

/**
 * The artists Debord cites in class, set back in long time.
 *
 * They come from the References tab, where their interest lies elsewhere —
 * knowing at which minute Debord speaks of them. Here they serve as backdrop:
 * they show the depth of history a body of teaching only two generations deep
 * leans on. Hence the literal background — a thin grey band under the main
 * timeline.
 */
import referencesBrut from '../data/references.json';

export type Classique = { id: string; nom: string; ne: number; mort: number; type: string };

export const CLASSIQUES: Classique[] = (
  referencesBrut as { id: string; nom: string; dates?: string; type: string }[]
)
  .flatMap((r) => {
    // "1606-1669" only: "IVe s. av. J.-C." does not sit on a scale of years, and
    // omitting it beats inventing it.
    const m = /^(\d{3,4})\s*[-–]\s*(\d{3,4})$/.exec(r.dates ?? '');
    if (!m) return [];
    return [{ id: r.id, nom: r.nom, ne: Number(m[1]), mort: Number(m[2]), type: r.type }];
  })
  .sort((a, b) => a.ne - b.ne);

/** Long-time scale, rounded to the half century. */
export const ECHELLE_LONGUE = (() => {
  const debut = Math.floor(Math.min(...CLASSIQUES.map((c) => c.ne)) / 50) * 50;
  const fin = Math.ceil(Math.max(ECHELLE.fin, ...CLASSIQUES.map((c) => c.mort)) / 50) * 50;
  const reperes: number[] = [];
  for (let a = debut; a <= fin; a += 100) reperes.push(a);
  return { debut, fin, reperes, place: (a: number) => ((a - debut) / (fin - debut)) * 100 };
})();
