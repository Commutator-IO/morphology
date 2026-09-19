import { useMemo, useState } from 'react';
import { Entete, Pied } from './components/Cadre';
import { Lecteur, type Lecture } from './components/Lecteur';
import { CarteReference } from './components/Reference';
import {
  correspondReference,
  ORDRE_TYPES,
  parNom,
  REFERENCES,
  totalDeReference,
  TYPES,
  type TypeReference,
} from './lib/references';

/**
 * Les références artistiques du cours.
 *
 * Debord ne sépare pas l'anatomie de son usage : presque chaque séance se ferme
 * sur des diapositives de tableaux, de dessins ou de sculptures où la forme
 * qu'on vient d'étudier se voit à l'œuvre. Cette page rassemble ces renvois pour
 * qu'on puisse y retourner directement.
 */
export function PageReferences() {
  const [requete, setRequete] = useState('');
  const [type, setType] = useState<TypeReference | null>(null);
  const [parMentions, setParMentions] = useState(true);
  const [lecture, setLecture] = useState<Lecture | null>(null);

  const resultats = useMemo(() => {
    const filtrees = REFERENCES.filter(
      (r) => (!type || r.type === type) && correspondReference(r, requete),
    );
    // Par défaut le plus cité d'abord : la fréquence dit à elle seule ce que
    // Debord regarde le plus, et c'est l'information que cette page apporte.
    return parMentions
      ? [...filtrees].sort(
          (a, b) => totalDeReference(b.id) - totalDeReference(a.id) || parNom(a, b),
        )
      : [...filtrees].sort(parNom);
  }, [requete, type, parMentions]);

  const mentions = useMemo(
    () => REFERENCES.reduce((s, r) => s + totalDeReference(r.id), 0),
    [],
  );

  return (
    <>
      <Entete chemin="/references/" />

      <main className="mx-auto max-w-4xl lg:max-w-6xl px-4 pb-16">
        <h1 className="titre mt-6 text-2xl leading-tight text-ink-900 sm:text-3xl">
          Ce que Debord donne à regarder
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
          Les séances se ferment presque toujours sur des œuvres : un Rembrandt à la
          plume, un écorché, une salle du Louvre où aller vérifier. {REFERENCES.length}{' '}
          références relevées, {mentions} mentions en tout.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
          Chaque nom de cette liste a été vérifié passage par passage. La
          transcription automatique confond volontiers un patronyme et un mot
          courant — « léger », « carrière », « boucher », « durer » — et ces faux
          amis ont été écartés à la main : voir la{' '}
          <a href="/methode/" className="text-brand-700 underline underline-offset-2">
            méthode
          </a>
          .
        </p>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-8">
          <div>
        <div className="sticky top-[5.75rem] z-20 -mx-4 mt-5 border-b border-ink-200/70 bg-ink-50/95 px-4 pt-3 pb-2.5 backdrop-blur lg:mx-0 lg:px-0">
          <label className="sr-only" htmlFor="recherche-ref">
            Chercher une référence
          </label>
          <div className="relative">
            <input
              id="recherche-ref"
              type="search"
              value={requete}
              onChange={(e) => setRequete(e.target.value)}
              placeholder="Rembrandt, Louvre, écorché…"
              autoComplete="off"
              className="min-h-12 w-full rounded-xl border border-ink-300 bg-white px-3.5 text-base text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none"
            />
            {requete && (
              <button
                type="button"
                onClick={() => setRequete('')}
                aria-label="Effacer la recherche"
                className="absolute top-0 right-0 flex h-12 w-12 items-center justify-center text-ink-400 active:text-ink-700"
              >
                ✕
              </button>
            )}
          </div>

          <div className="rangee-filtres mt-2">
            <button
              type="button"
              onClick={() => setType(null)}
              aria-pressed={type === null}
              className={`puce-filtre ${
                type === null
                  ? 'border-ink-800 bg-ink-800 text-white'
                  : 'border-ink-300 bg-white text-ink-600'
              }`}
            >
              Tout
            </button>
            {ORDRE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(type === t ? null : t)}
                aria-pressed={type === t}
                className={`puce-filtre ${
                  type === t
                    ? 'border-ink-800 bg-ink-800 text-white'
                    : 'border-ink-300 bg-white text-ink-600'
                }`}
              >
                {TYPES[t].pluriel}
              </button>
            ))}
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-3">
            <p className="tabular text-xs text-ink-500">
              {resultats.length} référence{resultats.length > 1 ? 's' : ''}
            </p>
            <label className="flex items-center gap-1.5 text-xs text-ink-500">
              Trier
              <select
                value={parMentions ? 'mentions' : 'alpha'}
                onChange={(e) => setParMentions(e.target.value === 'mentions')}
                className="min-h-9 rounded-lg border border-ink-300 bg-white px-2 text-xs text-ink-800"
              >
                <option value="mentions">Le plus cité</option>
                <option value="alpha">A → Z</option>
              </select>
            </label>
          </div>
        </div>

            {resultats.length === 0 ? (
              <p className="mt-8 text-[15px] leading-relaxed text-ink-600">
                Aucune référence ne correspond à « {requete} ».
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {resultats.map((r) => (
                  <CarteReference
                    key={r.id}
                    reference={r}
                    ouvertParDefaut={resultats.length === 1}
                    onLire={setLecture}
                  />
                ))}
              </div>
            )}
          </div>

          <Lecteur lecture={lecture} onFermer={() => setLecture(null)} />
        </div>
      </main>

      <Pied />
    </>
  );
}
