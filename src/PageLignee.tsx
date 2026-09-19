import { useEffect, useRef, useState } from 'react';
import { Entete, Pied } from './components/Cadre';
import {
  DATEES,
  ECHELLE,
  FIGURES,
  finDe,
  parSection,
  SECTIONS,
  type Figure,
} from './lib/lignee';

/**
 * La lignée, sous forme de frise.
 *
 * Reprise du motif de l'onglet Timeline de germain-project : une règle collée
 * sous l'en-tête, une barre par vie sur la même échelle, et la barre de la
 * fiche qu'on lit qui s'allume à mesure qu'on descend la colonne.
 *
 * Ici la frise n'est pas un ornement : elle montre d'un coup d'œil ce qu'une
 * liste ne dit pas — que Richer meurt cinq ans avant la naissance de Debord, de
 * sorte que la transmission passe par les livres et non par la parole, et que
 * ses élèves naissent tous pendant qu'il enseigne déjà.
 */

/** Une figure dont l'année de naissance est établie. */
function barre(f: Figure) {
  return { gauche: ECHELLE.place(f.ne!), largeur: ECHELLE.place(finDe(f)) - ECHELLE.place(f.ne!) };
}

/**
 * La règle, collée sous l'en-tête.
 *
 * La vie qu'on lit y est tracée en sanguine, son année de naissance imprimée
 * au-dessus : descendre la page promène la barre sur près de deux siècles.
 */
function Regle({ actif }: { actif: Figure }) {
  const { gauche, largeur } = barre(actif);
  return (
    <div className="sticky top-[5.75rem] z-20 -mx-4 border-b border-ink-200/70 bg-ink-50/95 px-4 py-2.5 backdrop-blur">
      <div className="relative h-10">
        <div className="absolute top-5 right-0 left-0 h-px bg-ink-300" />
        {ECHELLE.reperes.map((a) => (
          <span
            key={a}
            className={`tabular absolute top-6 -translate-x-1/2 text-[10px] ${
              a % 50 === 0 ? 'font-semibold text-ink-600' : 'text-ink-400'
            }`}
            style={{ left: `${ECHELLE.place(a)}%` }}
          >
            {a}
          </span>
        ))}
        <span
          aria-hidden="true"
          className="absolute top-[17px] h-[7px] rounded-full bg-brand-200 transition-all duration-300"
          style={{ left: `${gauche}%`, width: `${largeur}%` }}
        />
        {DATEES.map((f) => {
          const allume = f.id === actif.id;
          return (
            <span
              key={f.id}
              title={`${f.nom}, ${f.ne}`}
              className="absolute -translate-x-1/2 rounded-full transition-all duration-300"
              style={{
                left: `${ECHELLE.place(f.ne!)}%`,
                top: allume ? 16 : 18,
                width: allume ? 9 : 5,
                height: allume ? 9 : 5,
                background: allume ? 'var(--color-brand-600)' : 'var(--color-ink-400)',
              }}
            />
          );
        })}
        <span
          aria-hidden="true"
          className="tabular absolute top-0 -translate-x-1/2 text-[11px] font-semibold whitespace-nowrap text-brand-700 transition-all duration-300"
          style={{ left: `${gauche}%` }}
        >
          {actif.ne}
        </span>
      </div>
    </div>
  );
}

/**
 * Toutes les vies d'un coup.
 *
 * Une barre par personne sur l'échelle de la règle, celle qu'on lit en
 * sanguine, celle de Debord en ocre pour qu'on retrouve le centre. Cliquer une
 * barre mène à sa fiche.
 */
function Frise({ actif, onChoisir }: { actif: Figure; onChoisir: (f: Figure) => void }) {
  return (
    <figure className="card mt-6 px-4 py-4">
      <figcaption className="text-[11px] font-bold tracking-[0.1em] text-ink-500 uppercase">
        {DATEES.length} vies, {ECHELLE.debut}–{ECHELLE.fin}
      </figcaption>
      <div className="relative mt-3">
        {ECHELLE.reperes.map((a) => (
          <span
            key={a}
            aria-hidden="true"
            className={`absolute top-0 bottom-5 w-px ${a % 50 === 0 ? 'bg-ink-200' : 'bg-ink-100'}`}
            style={{ left: `${ECHELLE.place(a)}%` }}
          />
        ))}
        <ul className="relative space-y-[3px] pb-5">
          {DATEES.map((f) => {
            const allume = f.id === actif.id;
            const centre = f.role === 'lui';
            const { gauche, largeur } = barre(f);
            return (
              <li key={f.id} className="relative h-[17px]">
                <button
                  type="button"
                  onClick={() => onChoisir(f)}
                  title={`${f.nom} (${f.dates})`}
                  className={`absolute inset-y-0 flex items-center overflow-visible rounded-sm transition-colors ${
                    allume
                      ? 'bg-brand-600'
                      : centre
                        ? 'bg-os-300 hover:bg-os-500'
                        : 'bg-ink-200 hover:bg-brand-200'
                  }`}
                  style={{ left: `${gauche}%`, width: `${largeur}%` }}
                >
                  <span
                    className={`pl-1.5 text-[10.5px] leading-none font-medium whitespace-nowrap ${
                      allume ? 'text-white' : 'text-ink-700'
                    }`}
                  >
                    {f.nom}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {ECHELLE.reperes
          .filter((a) => a % 50 === 0)
          .map((a) => (
            <span
              key={a}
              className="tabular absolute bottom-0 -translate-x-1/2 text-[10px] text-ink-400"
              style={{ left: `${ECHELLE.place(a)}%` }}
            >
              {a}
            </span>
          ))}
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-ink-500">
        Richer meurt cinq ans avant la naissance de Debord : entre eux la
        transmission passe par les livres, non par la parole. Les élèves, eux,
        naissent tous pendant qu'il enseigne déjà.
      </p>
    </figure>
  );
}

export function PageLignee() {
  const [actif, setActif] = useState<Figure>(DATEES[0]);
  const fiches = useRef<(HTMLElement | null)[]>([]);

  /**
   * La fiche la plus proche du tiers supérieur de l'écran est celle qu'on lit.
   * `rootMargin` resserre la bande observée à ce bandeau, pour que la règle
   * bouge quand une fiche arrive plutôt que quand la précédente s'en va.
   */
  useEffect(() => {
    const noeuds = fiches.current.filter((n): n is HTMLElement => n !== null);
    if (!noeuds.length || typeof IntersectionObserver === 'undefined') return;
    const observateur = new IntersectionObserver(
      (entrees) => {
        const vue = entrees.find((e) => e.isIntersecting);
        const id = vue?.target.getAttribute('data-figure');
        const f = DATEES.find((x) => x.id === id);
        if (f) setActif(f);
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0 },
    );
    noeuds.forEach((n) => observateur.observe(n));
    return () => observateur.disconnect();
  }, []);

  const numerises = FIGURES.flatMap((f) => f.ouvrages).filter((o) => o.url).length;
  let rang = 0;

  return (
    <>
      <Entete chemin="/lignee/" />

      <main className="mx-auto max-w-4xl px-4 pb-16">
        <h1 className="titre mt-4 text-xl leading-tight text-ink-900 sm:mt-6 sm:text-3xl">
          Lignée
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
          Un cours ne sort pas de rien. Celui-ci prolonge une chaire tenue depuis
          le XIX<sup>e</sup> siècle, et il a formé des élèves qui écrivent et
          dessinent à leur tour. {numerises} des ouvrages cités sont librement
          consultables en ligne.
        </p>

        <Frise
          actif={actif}
          onChoisir={(f) =>
            document.getElementById(f.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        />

        <Regle actif={actif} />

        <div className="mt-8 space-y-10">
          {SECTIONS.map((section) => {
            const figures = parSection(section.role);
            if (!figures.length) return null;
            return (
              <section key={section.role}>
                <h2 className="titre text-xl leading-tight text-ink-900">{section.titre}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-600">{section.propos}</p>

                <div className="mt-4 space-y-3">
                  {figures.map((f) => {
                    const i = rang++;
                    return (
                      <article
                        key={f.id}
                        id={f.id}
                        data-figure={f.id}
                        ref={(n) => {
                          fiches.current[i] = n;
                        }}
                        className="card scroll-mt-44 px-4 py-3.5"
                      >
                        <h3 className="titre text-[17px] leading-tight text-ink-900">
                          {f.nom}
                          {f.dates && (
                            <span className="tabular ml-2 text-[13px] font-normal text-ink-400">
                              {f.dates}
                            </span>
                          )}
                        </h3>

                        <p className="mt-2 text-[15px] leading-relaxed text-ink-800">{f.notice}</p>

                        {f.ouvrages.length > 0 && (
                          <ul className="mt-3 space-y-2">
                            {f.ouvrages.map((o) => (
                              <li key={o.titre} className="text-[14px] leading-relaxed">
                                <i className="text-ink-900">{o.titre}</i>
                                {(o.editeur || o.annee) && (
                                  <span className="text-ink-500">
                                    {o.editeur ? `, ${o.editeur}` : ''}
                                    {o.annee ? `, ${o.annee}` : ''}
                                  </span>
                                )}
                                {o.url && (
                                  <>
                                    {' — '}
                                    <a
                                      href={o.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-brand-700 underline underline-offset-2"
                                    >
                                      {o.url.includes('archive.org')
                                        ? 'lire en ligne ↗'
                                        : 'chez l’éditeur ↗'}
                                    </a>
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* La source est affichée et non reléguée : une
                            bibliographie sans provenance est une liste
                            d'affirmations. */}
                        <p className="mt-3 border-t border-ink-100 pt-2.5 text-xs leading-relaxed text-ink-400">
                          {f.source}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <Pied />
    </>
  );
}
