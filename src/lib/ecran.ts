/**
 * Le seuil au-delà duquel un lecteur tient à côté de la liste.
 *
 * Même valeur que le `lg:` de Tailwind, qui commande la grille à deux colonnes :
 * les deux doivent basculer ensemble, sinon on ouvre le lecteur dans un panneau
 * qui n'est pas affiché.
 */
export const SEUIL_LECTEUR = 1024;

/**
 * Y a-t-il la place d'un lecteur à côté ?
 *
 * Interrogé au moment du clic et non au rendu : entre les deux, l'écran a pu
 * tourner ou la fenêtre changer de taille, et c'est la largeur au moment où l'on
 * touche l'horodatage qui décide s'il faut rester sur la page ou partir sur
 * YouTube.
 */
export function placePourLecteur(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(`(min-width: ${SEUIL_LECTEUR}px)`).matches;
}
