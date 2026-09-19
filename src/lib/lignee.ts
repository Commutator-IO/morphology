/**
 * Ce qui vient avant le cours et ce qui en sort : la chaire d'anatomie
 * artistique avant Debord, et ceux qu'il a formés.
 *
 * Bibliographie de morphologie seulement. Debord a formé des peintres et des
 * dessinateurs qui n'ont rien écrit sur la discipline — ils n'ont pas leur
 * place ici, où l'on ne recense que ce qui prolonge l'enseignement lui-même.
 *
 * Chaque entrée porte sa source. C'est la règle du site : on ne cite pas de
 * mémoire, et ce qui n'a pas pu être vérifié le dit.
 */
import brut from '../data/lignee.json';

export type Role = 'avant' | 'apres' | 'autour';

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
    role: 'apres',
    titre: "Ceux qu'il a formés",
    propos:
      "Des élèves qui ont écrit à leur tour, et porté la discipline ailleurs — vers le carnet de dessin, vers le geste sportif.",
  },
  {
    role: 'autour',
    titre: 'Autour du cours',
    propos:
      "Un collègue de la même maison, et le seul livre tiré du cours lui-même.",
  },
];

export const parSection = (role: Role) => FIGURES.filter((f) => f.role === role);
