import { useState } from 'react';
import { Entete, Pied } from './components/Cadre';
import { Lecteur, type Lecture } from './components/Lecteur';
import { GROUPES, GROUPE_PAR_ID } from './lib/couleurs';
import { duree, lienYoutube, PARTIES, SEANCES, termesDe } from './lib/lexique';

/**
 * Les 43 séances, regroupées par partie.
 *
 * L'ordre est celui du raisonnement de Debord — l'ensemble avant la région, la
 * région avant le muscle — et non celui de la playlist, qui mêle les sujets au
 * fil de la publication. Le rang d'origine reste affiché pour qu'on retrouve la
 * séance dans la playlist.
 */

/** Les quelques termes les plus présents dans une séance : de quoi savoir ce
 *  qu'on va y trouver sans avoir à l'ouvrir. Quatre suffisent sur un téléphone ;
 *  au-delà, la liste cesse d'être lisible d'un coup d'œil. */
const APERCU = 4;

export function PageSeances() {
  const total = SEANCES.reduce((s, x) => s + (x.dureeS ?? 0), 0);
  const [lecture, setLecture] = useState<Lecture | null>(null);
  // Même filtre que sur le vocabulaire, pour qu'on puisse passer de l'un à
  // l'autre sans changer de façon de penser : « les mains », des deux côtés.
  const [groupe, setGroupe] = useState<string | null>(null);

  const partiesVisibles = groupe
    ? PARTIES.filter((p) => GROUPE_PAR_ID.get(groupe)?.parties.includes(p.id))
    : PARTIES;

  return (
    <>
      <Entete chemin="/seances/" />

      <main className="mx-auto max-w-4xl lg:max-w-6xl px-4 pb-16">
        <h1 className="titre mt-6 text-2xl leading-tight text-ink-900 sm:text-3xl">
          Les {SEANCES.length} séances
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
          Environ {Math.round(total / 3600)} heures de cours filmées aux Beaux-Arts
          de Paris. Les séances sont rangées ici dans l'ordre du raisonnement —
          l'ensemble d'abord, la région ensuite, le muscle en dernier — et non dans
          celui de la playlist, qui mêle les sujets. Le numéro rappelle le rang
          d'origine.
        </p>

        <div className="-mx-4 mt-5 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setGroupe(null)}
            aria-pressed={groupe === null}
            className={`puce-filtre ${
              groupe === null
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-ink-300 bg-white text-ink-600'
            }`}
          >
            Tout le cours
          </button>
          {GROUPES.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroupe(groupe === g.id ? null : g.id)}
              aria-pressed={groupe === g.id}
              className={`puce-filtre ${
                groupe === g.id
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-ink-300 bg-white text-ink-600'
              }`}
            >
              {g.libelle}
            </button>
          ))}
        </div>

        {groupe === null && (
          <nav aria-label="Parties" className="mt-3 flex flex-wrap gap-1.5">
            {PARTIES.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="puce-filtre border-ink-300 bg-white text-ink-600"
              >
                {p.titre}
              </a>
            ))}
          </nav>
        )}

        <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-start lg:gap-8">
          <div className="space-y-10">
            {groupe && (
              <p className="text-[13px] leading-relaxed text-ink-600">
                Séances consacrées à cette région. L'introduction et les vues
                d'ensemble, qui ne portent sur aucune région en particulier,
                reviennent avec{' '}
                <button
                  type="button"
                  onClick={() => setGroupe(null)}
                  className="text-brand-700 underline underline-offset-2"
                >
                  Tout le cours
                </button>
                .
              </p>
            )}
          {partiesVisibles.map((partie) => {
            const seances = SEANCES.filter((s) => s.partie === partie.id);
            const heures = seances.reduce((a, s) => a + (s.dureeS ?? 0), 0);
            return (
              <section key={partie.id} id={partie.id} className="scroll-mt-32">
                <h2 className="titre text-xl leading-tight text-ink-900">{partie.titre}</h2>
                <p className="tabular mt-1 text-xs text-ink-400">
                  {seances.length} séance{seances.length > 1 ? 's' : ''} ·{' '}
                  {(heures / 3600).toFixed(1).replace('.', ',')} h
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-600">{partie.propos}</p>

                <ul className="mt-4 space-y-2">
                  {seances.map((s) => {
                    const vocabulaire = termesDe(s.id).slice(0, APERCU);
                    return (
                      <li key={s.id} className="card px-4 py-3.5">
                        <a
                          href={lienYoutube(s.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-start gap-3"
                          onClick={(e) => {
                            // Même règle que les horodatages : un clic modifié
                            // reste une navigation ordinaire vers YouTube.
                            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                            e.preventDefault();
                            setLecture({ videoId: s.id, instant: 0, titre: s.titre });
                          }}
                        >
                          <span className="tabular mt-0.5 shrink-0 text-sm text-ink-400">
                            {s.rang}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="titre block text-[16px] leading-snug text-ink-900">
                              {s.titre}
                            </span>
                            <span className="tabular mt-1 block text-xs text-ink-400">
                              {duree(s.dureeS)} · voir sur YouTube ↗
                            </span>
                          </span>
                        </a>

                        {vocabulaire.length > 0 && (
                          <p className="mt-2.5 flex flex-wrap gap-x-2 gap-y-1 text-xs leading-relaxed text-ink-500">
                            {vocabulaire.map(({ terme, n }) => (
                              <a
                                key={terme.id}
                                href={`/#${terme.id}`}
                                className="underline decoration-ink-300 underline-offset-2"
                              >
                                {terme.terme}
                                <span className="tabular text-ink-400"> {n}</span>
                              </a>
                            ))}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
          </div>

          <Lecteur lecture={lecture} onFermer={() => setLecture(null)} />
        </div>
      </main>

      <Pied />
    </>
  );
}
