/**
 * En-tête et pied partagés.
 *
 * Le site est statique : chaque vue est une vraie page servie depuis son propre
 * index.html, sans routeur côté client, et un lien partagé survit.
 *
 * Trois onglets seulement, donc pas de menu replié : à 375 px les trois tiennent
 * sur une ligne, et un menu à ouvrir coûterait un geste de plus à quelqu'un qui
 * cherche un mot pendant une séance de dessin.
 */

const VUES: { chemin: string; libelle: string }[] = [
  { chemin: '/', libelle: 'Vocabulaire' },
  { chemin: '/references/', libelle: 'Références' },
  { chemin: '/seances/', libelle: 'Séances' },
  { chemin: '/methode/', libelle: 'Méthode' },
];

function estActif(chemin: string, courant: string): boolean {
  const n = (c: string) => (c.endsWith('/') ? c : `${c}/`);
  return n(courant) === n(chemin);
}

export function Entete({ chemin }: { chemin: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-200/70 bg-ink-50/90 backdrop-blur">
      <div className="mx-auto max-w-4xl lg:max-w-6xl px-4 pt-2.5 pb-2">
        <a href="/" className="flex items-baseline gap-2">
          <span className="titre text-[17px] text-ink-900">Morphologie</span>
          <span className="text-[13px] text-ink-500">Jean-François&nbsp;Debord</span>
        </a>
        <nav className="-mx-1 mt-2 flex gap-1" aria-label="Vues">
          {VUES.map((v) => {
            const actif = estActif(v.chemin, chemin);
            return (
              <a
                key={v.chemin}
                href={v.chemin}
                aria-current={actif ? 'page' : undefined}
                /* min-h-11 : cible tactile de 44 px. Les onglets sont touchés
                   en marchant dans un atelier, pas cliqués à la souris. */
                className={[
                  'flex min-h-11 flex-1 items-center justify-center rounded-lg px-1.5 text-[13px] transition sm:px-2 sm:text-sm',
                  actif
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
          , filmé aux Beaux-Arts de Paris et publié par l'Université PSL. Les
          séances appartiennent à leurs auteurs ; ce site n'en héberge aucune et
          se contente d'y renvoyer.
        </p>
        <p className="mt-4">
          Un outil{' '}
          <a
            href="https://www.commutator.io"
            className="underline underline-offset-4 transition hover:text-ink-900"
          >
            Commutator
          </a>{' '}
          ·{' '}
          <a
            href="https://github.com/Commutator-IO/morphology"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 transition hover:text-ink-900"
          >
            code source
          </a>
        </p>
      </div>
    </footer>
  );
}
