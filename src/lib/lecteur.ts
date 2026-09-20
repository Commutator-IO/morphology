/**
 * The player's width against the column of text, on a large screen.
 *
 * The right balance depends on what you are doing: reading a definition with
 * the session in the corner of your eye, or watching Debord draw with the index
 * to hand. Rather than impose a compromise, three settings.
 *
 * Class names are written out in full rather than composed at runtime: Tailwind
 * only generates what it reads in the sources, and a concatenated class name
 * would produce no rule at all.
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

/** Guarded read: in private browsing, touching storage can throw. */
export function lireTaille(): TailleLecteur {
  try {
    const v = localStorage.getItem(CLE);
    if (TAILLES.some((t) => t.id === v)) return v as TailleLecteur;
  } catch {
    /* storage unavailable */
  }
  return 'moyenne';
}

export function ecrireTaille(taille: TailleLecteur): void {
  try {
    localStorage.setItem(CLE, taille);
  } catch {
    /* the setting still works, it just does not outlive the visit */
  }
}
