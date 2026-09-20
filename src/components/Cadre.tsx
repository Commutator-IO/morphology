import { useEffect, useRef, useState } from 'react';

/**
 * Shared header and footer.
 *
 * The site is static: every view is a real page served from its own index.html,
 * with no client-side router, and a shared link survives.
 *
 * Five tabs no longer fit in 375 px — the last was cut off. So the bar scrolls
 * sideways below sm, with a fade telling you more is off screen, and the
 * current tab is brought into view on load, or you land on a page whose tab is
 * invisible.
 *
 * Rather than a folded menu: opening a menu costs one more gesture to someone
 * looking a word up mid-drawing, and shortening the labels would make them
 * unreadable.
 *
 * On a phone the bar hides as you scroll down and returns as you scroll up:
 * ninety-eight pixels of title and tabs held permanently, often with a filter
 * bar stuck under them, left little of the screen for what you came to read. It
 * stays put while you are near the top, and never moves from lg up.
 */

/** How much room the header takes at the top, for whatever sticks under it.
 *  Page toolbars refer to it through `top-[var(--haut-entete)]` rather than a
 *  hard-coded value: when the header hides, they rise with it instead of
 *  leaving a blank band the list would scroll through bare. */
const HAUT = '5.75rem';

/** Below this the header stays: you do not hide a bar you have not finished
 *  scrolling past. And under eight pixels of movement nothing moves — a finger
 *  shaking on a touchscreen must not make the page flicker. */
const SEUIL_BAS = 96;
const SEUIL_GESTE = 8;

const VUES: { chemin: string; libelle: string }[] = [
  { chemin: '/', libelle: 'Vocabulaire' },
  { chemin: '/references/', libelle: 'Références' },
  { chemin: '/digressions/', libelle: 'Digressions' },
  { chemin: '/seances/', libelle: 'Séances' },
  { chemin: '/lignee/', libelle: 'Lignée' },
  { chemin: '/methode/', libelle: 'Méthode' },
];

function estActif(chemin: string, courant: string): boolean {
  const n = (c: string) => (c.endsWith('/') ? c : `${c}/`);
  return n(courant) === n(chemin);
}

export function Entete({ chemin }: { chemin: string }) {
  const actif = useRef<HTMLAnchorElement>(null);
  const [efface, setEfface] = useState(false);

  useEffect(() => {
    // `nearest` rather than `center`: on a large screen nothing scrolls, and
    // we certainly do not want to move the page under the reader's eyes.
    actif.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, []);

  useEffect(() => {
    const grandEcran = window.matchMedia('(min-width: 1024px)');
    let precedent = window.scrollY;

    const auDefilement = () => {
      if (grandEcran.matches) return;
      const y = window.scrollY;
      const pas = y - precedent;
      if (Math.abs(pas) < SEUIL_GESTE) return;
      precedent = y;
      setEfface(pas > 0 && y > SEUIL_BAS);
    };

    // Back on a large screen the header returns: without this, a bar hidden on
    // a phone would stay hidden after a rotation or a switch to a wide window.
    const auFormat = () => grandEcran.matches && setEfface(false);

    window.addEventListener('scroll', auDefilement, { passive: true });
    grandEcran.addEventListener('change', auFormat);
    return () => {
      window.removeEventListener('scroll', auDefilement);
      grandEcran.removeEventListener('change', auFormat);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--haut-entete', efface ? '0px' : HAUT);
  }, [efface]);

  return (
    <header
      className={`sticky top-0 z-30 border-b border-ink-200/70 bg-ink-50/90 backdrop-blur transition-transform duration-200 ${
        efface ? 'max-lg:-translate-y-full' : ''
      }`}
    >
      <div className="mx-auto max-w-4xl lg:max-w-6xl px-4 pt-2.5 pb-2">
        <a href="/" className="flex items-baseline gap-2">
          <span className="titre text-[17px] text-ink-900">Morphologie</span>
          <span className="text-[13px] text-ink-500">Jean-François&nbsp;Debord</span>
        </a>
        <nav
          className="-mx-4 mt-2 flex gap-1 overflow-x-auto px-4 pb-0.5 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Vues"
          style={{
            maskImage: 'linear-gradient(to right, #000 calc(100% - 1.5rem), transparent)',
          }}
        >
          {VUES.map((v) => {
            const estCourant = estActif(v.chemin, chemin);
            return (
              <a
                key={v.chemin}
                ref={estCourant ? actif : undefined}
                href={v.chemin}
                aria-current={estCourant ? 'page' : undefined}
                /* min-h-11: a 44 px touch target. The tabs get tapped while
                   walking around a studio, not clicked with a mouse. */
                className={[
                  'flex min-h-11 shrink-0 items-center justify-center rounded-lg px-3 text-[13px] whitespace-nowrap transition sm:flex-1 sm:px-2 sm:text-sm',
                  estCourant
                    ? 'bg-brand-600 font-semibold text-white'
                    : 'font-medium text-ink-600 active:bg-ink-200',
                ].join(' ')}
              >
                {v.libelle}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function Pied() {
  return (
    <footer className="mt-12 border-t border-ink-200/70 bg-white">
      <div className="mx-auto max-w-4xl lg:max-w-6xl px-4 py-8 text-sm leading-relaxed text-ink-500">
        <p>
          Index de travail pour le{' '}
          <a
            href="https://www.youtube.com/playlist?list=PLYnh6UuzuHLtlgap6QPtov3MhLmWeIrEp"
            target="_blank"
            rel="noreferrer"
            className="text-brand-700 underline underline-offset-4"
          >
            cours de morphologie de Jean-François Debord
          </a>
          , filmé aux Beaux-Arts de Paris et publié par l'Université PSL, qui en tient aussi
          le{' '}
          <a
            href="https://bibnum.explore.psl.eu/s/psl/ark:/18469/290s8"
            target="_blank"
            rel="noreferrer"
            className="text-brand-700 underline underline-offset-4"
          >
            catalogue de référence
          </a>
          . Les séances appartiennent à leurs auteurs ; ce site n'en héberge aucune et se
          contente d'y renvoyer.
        </p>
        <p className="mt-4">
          Un projet{' '}
          <a
            href="https://www.commutator.io"
            className="underline underline-offset-4 transition hover:text-ink-900"
          >
            Commutator — www.commutator.io
          </a>{' '}
          ·{' '}
          <a
            href="https://github.com/Commutator-IO/morphology"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 transition hover:text-ink-900"
          >
            code source
          </a>{' '}
          ·{' '}
          <a
            href="/mentions/"
            className="underline underline-offset-4 transition hover:text-ink-900"
          >
            mentions légales
          </a>
        </p>
      </div>
    </footer>
  );
}
