import { Entete, Pied } from './components/Cadre';
import { FIGURES, parSection, SECTIONS } from './lib/lignee';

/**
 * D'où vient ce cours, et ce qu'il a produit.
 *
 * Bibliographie de morphologie seulement : Debord a formé des peintres et des
 * dessinateurs qui n'ont rien écrit sur la discipline, et ils n'ont pas leur
 * place ici. Chaque entrée porte sa source, y compris quand la vérification a
 * échoué — c'est la règle du site, et elle vaut pour une bibliographie plus
 * encore qu'ailleurs, où la citation de mémoire est la faute ordinaire.
 */
export function PageLignee() {
  const numerises = FIGURES.flatMap((f) => f.ouvrages).filter((o) => o.url).length;

  return (
    <>
      <Entete chemin="/lignee/" />

      <main className="mx-auto max-w-4xl px-4 pb-16">
        <h1 className="titre mt-4 text-xl leading-tight text-ink-900 sm:mt-6 sm:text-3xl">
          Lignée
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
          Un cours ne sort pas de rien. Celui-ci prolonge une chaire tenue depuis
          le XIX<sup>e</sup> siècle, et il a formé des élèves qui écrivent à leur
          tour. Bibliographie de morphologie seulement — {numerises} de ces
          ouvrages sont librement consultables en ligne.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
          Jean-François Debord a enseigné aux Beaux-Arts de Paris jusqu'en 2003.
          Il est mort le 29 juin 2025.
        </p>

        <div className="mt-8 space-y-10">
          {SECTIONS.map((section) => {
            const figures = parSection(section.role);
            if (!figures.length) return null;
            return (
              <section key={section.role}>
                <h2 className="titre text-xl leading-tight text-ink-900">
                  {section.titre}
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-600">
                  {section.propos}
                </p>

                <div className="mt-4 space-y-3">
                  {figures.map((f) => (
                    <article key={f.id} id={f.id} className="card px-4 py-3.5">
                      <h3 className="titre text-[17px] leading-tight text-ink-900">
                        {f.nom}
                        {f.dates && (
                          <span className="tabular ml-2 text-[13px] font-normal text-ink-400">
                            {f.dates}
                          </span>
                        )}
                      </h3>

                      <p className="mt-2 text-[15px] leading-relaxed text-ink-800">
                        {f.notice}
                      </p>

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
                          bibliographie sans provenance est une liste d'affirmations. */}
                      <p className="mt-3 border-t border-ink-100 pt-2.5 text-xs leading-relaxed text-ink-400">
                        {f.source}
                      </p>
                    </article>
                  ))}
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
