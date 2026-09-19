/**
 * Largeur du lecteur face à la colonne de texte, sur grand écran.
 *
 * Selon ce qu'on fait, l'équilibre n'est pas le même : on lit une définition en
 * gardant la séance à l'œil, ou l'on regarde Debord dessiner en gardant l'index
 * sous la main. Plutôt que d'imposer un compromis, on laisse trois crans.
 *
 * Les classes sont écrites en toutes lettres et non composées à la volée :
 * Tailwind ne génère que ce qu'il lit dans les sources, et une classe fabriquée
 * par concaténation ne produirait aucune règle.
 */
export const TAILLES = [
  { id: 'petite', libelle: 'Petite', grille: 'lg:grid-cols-[minmax(0,1fr)_22rem]' },
  { id: 'moyenne', libelle: 'Moyenne', grille: 'lg:grid-cols-[minmax(0,1fr)_30rem]' },
  { id: 'grande', libelle: 'Grande', grille: 'lg:grid-cols-[minmax(0,1fr)_42rem]' },
] as const;

export type TailleLecteur = (typeof TAILLES)[number]['id'];

const CLE = 'morpho.lecteur';

export function grilleDe(taille: TailleLecteur): string {
  return (TAILLES.find((t) => t.id === taille) ?? TAILLES[1]).grille;
}

/** Lecture protégée : en navigation privée, l'accès au stockage peut lever. */
export function lireTaille(): TailleLecteur {
  try {
    const v = localStorage.getItem(CLE);
    if (TAILLES.some((t) => t.id === v)) return v as TailleLecteur;
  } catch {
    /* stockage indisponible */
  }
  return 'moyenne';
}

export function ecrireTaille(taille: TailleLecteur): void {
  try {
    localStorage.setItem(CLE, taille);
  } catch {
    /* le réglage marche quand même, il ne survit pas à la visite */
  }
}
