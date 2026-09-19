import { useEffect, useState } from 'react';

/**
 * Amène la fiche visée par l'ancre de l'URL, et la désigne à l'appelant.
 *
 * Le navigateur cherche `#rubens` au chargement du document, c'est-à-dire avant
 * que React n'ait rendu quoi que ce soit : l'élément n'existe pas encore, et
 * l'on reste en haut de la page. Il faut donc refaire le travail après le
 * montage.
 *
 * L'identifiant est aussi rendu à l'appelant, pour qu'il puisse déplier la
 * fiche visée : arriver sur une carte repliée, c'est arriver sur un titre sans
 * la réponse qu'on venait chercher.
 */
export function useAncre(): string | null {
  // Lu dès le premier rendu, et non dans un effet : `useState` ignore les
  // changements de prop qui suivent le montage, si bien qu'une fiche déjà
  // montée repliée le serait restée. L'ancre doit être connue avant que la
  // fiche n'existe.
  const [cible] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return decodeURIComponent(window.location.hash.replace(/^#/, '')) || null;
  });

  useEffect(() => {
    const id = cible;
    if (!id) return;
    // Deux tentatives, et non une : la fiche visée se déplie au montage, les
    // portraits se chargent, la frise se dessine — chacun de ces événements
    // déplace la cible après coup. Un seul essai atterrissait au mauvais
    // endroit, ou nulle part.
    //
    // `instant` parce que le document est en `scroll-behavior: smooth` : une
    // animation en cours est annulée par le second essai, et l'on ne bouge plus.
    const aller = () =>
      document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' });
    const t1 = window.setTimeout(aller, 120);
    const t2 = window.setTimeout(aller, 500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [cible]);

  return cible;
}
