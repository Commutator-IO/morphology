/**
 * Ce qui vient avant le cours et ce qui en sort : la chaire d'anatomie
 * artistique avant Debord, et ceux qu'il a formés.
 *
 * Deux sortes d'héritiers : ceux qui ont écrit la morphologie à leur tour, et
 * ceux qui la pratiquent sans en avoir rien publié. Les seconds n'ont pas de
 * bibliographie, mais les omettre donnerait une image fausse de ce que le cours
 * a produit — un enseignement de dessin se juge d'abord sur des dessinateurs.
 *
 * Chaque entrée porte sa source. C'est la règle du site : on ne cite pas de
 * mémoire, et ce qui n'a pas pu être vérifié le dit.
 */
import brut from '../data/lignee.json';

export type Role = 'avant' | 'lui' | 'apres' | 'artistes' | 'autour';

export type Ouvrage = {
  titre: string;
  editeur?: string;
  annee?: string;
  /** Numérisation librement consultable, quand elle existe. */
  url?: string;
};

export type Figure = {
  id: string;
  nom: string;
  dates?: string;
  /** Année de naissance, quand elle a pu être vérifiée. Sans elle, la figure
   *  garde sa fiche mais n'est pas placée sur la frise : mieux vaut absente que
   *  mal datée. */
  ne?: number;
  /** Année de mort ; absente pour les vivants. */
  mort?: number;
  role: Role;
  notice: string;
  ouvrages: Ouvrage[];
  source: string;
};

export const FIGURES = brut as Figure[];

export const SECTIONS: { role: Role; titre: string; propos: string }[] = [
  {
    role: 'avant',
    titre: 'La chaire avant lui',
    propos:
      "Les traités sur lesquels l'enseignement français de la morphologie s'est bâti. Debord s'y appuie et les corrige d'après le vivant, souvent dans la même phrase.",
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

/** Les figures placées sur la frise : celles dont l'année de naissance est établie. */
export const DATEES = FIGURES.filter((f) => f.ne).sort((a, b) => a.ne! - b.ne!);

/** L'année de fin d'une vie sur la frise — l'année courante pour les vivants. */
export function finDe(f: Figure): number {
  return f.mort ?? new Date().getFullYear();
}

/** Bornes de l'échelle, arrondies au quart de siècle de part et d'autre. */
export const ECHELLE = (() => {
  const debut = Math.floor(Math.min(...DATEES.map((f) => f.ne!)) / 25) * 25;
  const fin = Math.ceil(Math.max(...DATEES.map(finDe)) / 25) * 25;
  const reperes: number[] = [];
  for (let a = debut; a <= fin; a += 25) reperes.push(a);
  return { debut, fin, reperes, place: (a: number) => ((a - debut) / (fin - debut)) * 100 };
})();
