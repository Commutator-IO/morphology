import { useEffect, useState } from 'react';

/**
 * Scrolls to the card the URL's anchor points at, and names it to the caller.
 *
 * The browser looks for `#rubens` as the document loads — before React has
 * rendered anything, so the element does not exist yet and we stay at the top
 * of the page. The work has to be redone after mount.
 *
 * The id is handed back so the caller can unfold the target card: landing on a
 * collapsed card means landing on a heading without the answer one came for.
 */
export function useAncre(): string | null {
  // Read on the first render rather than in an effect: `useState` ignores prop
  // changes after mount, so a card already mounted collapsed would have stayed
  // that way. The anchor must be known before the card exists.
  const [cible] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return decodeURIComponent(window.location.hash.replace(/^#/, '')) || null;
  });

  useEffect(() => {
    const id = cible;
    if (!id) return;
    // Two attempts, not one: the target card unfolds on mount, portraits load,
    // the timeline draws — each of those moves the target afterwards. A single
    // attempt landed in the wrong place, or nowhere.
    //
    // `instant` because the document uses `scroll-behavior: smooth`: an
    // animation in flight would be cancelled by the second attempt, leaving us
    // stuck.
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
