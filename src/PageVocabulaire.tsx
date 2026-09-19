import { useEffect, useMemo, useState } from 'react';
import { Entete, Pied } from './components/Cadre';
import { Lecteur, type Lecture } from './components/Lecteur';
import { CarteTerme } from './components/Terme';
import {
  CATEGORIES,
  GROUPE_PAR_ID,
  GROUPES,
  groupeDeRegion,
  ORDRE_CATEGORIES,
  ORDRE_REGIONS,
  REGIONS,
  type Categorie,
} from './lib/couleurs';
import { correspond, LEXIQUE, parAlphabet, SEANCES, totalDe } from './lib/lexique';

/**
 * L'index du vocabulaire — la page qu'on ouvre en cours.
 *
 * Tout est pensé pour un téléphone tenu d'une main : la recherche et les filtres
 * restent collés en haut, les cartes sont repliées, et aucun élément touchable
 * ne descend sous 44 px de haut. Le tri par défaut est alphabétique parce qu'on
 * arrive en cherchant un mot précis, pas en explorant un classement.
 */

type Tri = 'alpha' | 'frequence' | 'region';

export function PageVocabulaire() {
  const [requete, setRequete] = useState('');
  const [categorie, setCategorie] = useState<Categorie | null>(null);
  // La région du corps est le filtre le plus utile après une séance d'atelier :
  // on arrive en sachant qu'on a travaillé les mains, pas en cherchant un mot.
  const [groupe, setGroupe] = useState<string | null>(null);
  const [tri, setTri] = useState<Tri>('alpha');
  // Sur grand écran, la séance se joue à droite ; sur téléphone ce panneau
  // n'est pas rendu et l'état reste simplement nul.
  const [lecture, setLecture] = useState<Lecture | null>(null);
  // Replié par défaut sur téléphone : on ouvre ce site pour retrouver un mot en
  // quelques secondes, pas pour régler des filtres.
  const [filtresOuverts, setFiltresOuverts] = useState(() => {
    // Le choix se retient d'une visite à l'autre : quelqu'un qui aime voir ses
    // filtres ne doit pas les redéployer à chaque fois. Lecture protégée — en
    // navigation privée l'accès au stockage peut lever.
    try {
      return localStorage.getItem('morpho.filtres') === 'ouverts';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('morpho.filtres', filtresOuverts ? 'ouverts' : 'replies');
    } catch {
      /* stockage indisponible : le repli marche quand même, il ne survit pas. */
    }
  }, [filtresOuverts]);

  const resultats = useMemo(() => {
    const filtres = LEXIQUE.filter(
      (t) =>
        (!categorie || t.categorie === categorie) &&
        (!groupe || groupeDeRegion(t.region) === groupe) &&
        correspond(t, requete),
    );
    if (tri === 'frequence') {
      return [...filtres].sort((a, b) => totalDe(b.id) - totalDe(a.id) || parAlphabet(a, b));
    }
    if (tri === 'region') {
      return [...filtres].sort(
        (a, b) =>
          ORDRE_REGIONS.indexOf(a.region) - ORDRE_REGIONS.indexOf(b.region) || parAlphabet(a, b),
      );
    }
    return [...filtres].sort(parAlphabet);
  }, [requete, categorie, groupe, tri]);

  // En tri par région, les entrées sont coupées par un intertitre : sans lui,
  // une liste triée sans qu'on voie pourquoi passe pour une liste en désordre.
  const groupes = useMemo(() => {
    if (tri !== 'region') return null;
    const m = new Map<string, typeof resultats>();
    for (const t of resultats) {
      const l = m.get(t.region) ?? [];
      l.push(t);
      m.set(t.region, l);
    }
    return [...m];
  }, [resultats, tri]);

  /** Ce que le bouton annonce quand tout est replié. */
  const filtresActifs = [
    groupe ? GROUPE_PAR_ID.get(groupe)?.libelle : null,
    categorie ? CATEGORIES[categorie].libelle : null,
  ].filter((x): x is string => Boolean(x));

  const passagesTotal = useMemo(
    () => LEXIQUE.reduce((s, t) => s + totalDe(t.id), 0),
    [],
  );

  return (
    <>
      <Entete chemin="/" />

      <main className="mx-auto max-w-4xl lg:max-w-6xl px-4 pb-16">
        {/* Sur téléphone, le titre est court et l'explication disparaît : elle
            repoussait la recherche sous la ligne de flottaison, alors que
            l'usage est de sortir le téléphone en cours et de chercher un mot.
            Le texte reste à partir de sm, où il ne coûte rien. */}
        <h1 className="titre mt-4 text-xl leading-tight text-ink-900 sm:mt-6 sm:text-3xl">
          <span className="sm:hidden">Vocabulaire de l'anatomie</span>
          <span className="hidden sm:inline">
            Le vocabulaire de l'anatomie, séance par séance
          </span>
        </h1>
        <p className="mt-3 hidden text-[15px] leading-relaxed text-ink-700 sm:block">
          {LEXIQUE.length} termes d'ostéologie, de myologie et de morphologie, avec
          pour chacun les moments du cours où Debord le prononce. Touchez un
          horodatage : la séance démarre à cet instant, sans quitter la page.
          Le bouton <i>Arrêter</i> — ou la touche Échap — coupe la lecture.
        </p>
        <p className="mt-2 hidden text-[13px] leading-relaxed text-ink-500 sm:block">
          {passagesTotal.toLocaleString('fr-FR')} passages repérés dans{' '}
          {SEANCES.length} séances, soit environ{' '}
          {Math.round(SEANCES.reduce((s, x) => s + (x.dureeS ?? 0), 0) / 3600)} heures
          de cours. Le repérage est automatique : lisez la{' '}
          <a href="/methode/" className="text-brand-700 underline underline-offset-2">
            méthode
          </a>{' '}
          pour savoir ce qu'il vaut.
        </p>

        {/* Barre d'outils collante. `top-[5.75rem]` la pose juste sous l'en-tête,
            lui-même collant : les deux ne doivent pas se chevaucher. */}
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-8">
          <div>
        <div className="sticky top-[5.75rem] z-20 -mx-4 mt-3 border-b sm:mt-5 border-ink-200/70 bg-ink-50/95 px-4 pt-3 pb-2.5 backdrop-blur lg:mx-0 lg:px-0">
          <label className="sr-only" htmlFor="recherche">
            Chercher un terme
          </label>
          <div className="relative">
            <input
              id="recherche"
              type="search"
              value={requete}
              onChange={(e) => setRequete(e.target.value)}
              placeholder="deltoïde, omoplate, aplomb…"
              autoComplete="off"
              /* text-base et non text-sm : sous 16 px, iOS zoome à la mise au
                 point du champ et décale toute la page. */
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

          {/* Tous les filtres sont repliés, à tout format.
              Ce qu'on vient lire, c'est une définition : trois rangées de puces
              au-dessus de la liste repoussaient les premiers termes hors de
              l'écran. Ne restent visibles que la recherche et une ligne. Rien
              n'est masqué en silence — le bouton porte le nom des filtres
              actifs, et se colore tant qu'il en reste un. */}
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <p className="tabular text-xs text-ink-500">
              {resultats.length} terme{resultats.length > 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={() => setFiltresOuverts((v) => !v)}
              aria-expanded={filtresOuverts}
              className={`flex min-h-9 items-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition ${
                filtresActifs.length
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-ink-300 bg-white text-ink-600'
              }`}
            >
              {filtresActifs.length ? filtresActifs.join(' · ') : 'Filtres'}
              <span aria-hidden="true" className="text-ink-400">
                {filtresOuverts ? '▴' : '▾'}
              </span>
            </button>
          </div>

          <div className={filtresOuverts ? 'block' : 'hidden'}>
          {/* Région d'abord : c'est par là qu'on arrive quand on révise ce
              qu'on vient d'étudier. Défilement horizontal assumé — six groupes
              ne tiennent pas sur 375 px, et les replier coûterait un geste. */}
          <div className="rangee-filtres mt-2">
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
              Tout le corps
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
          <div className="rangee-filtres mt-1.5">
            <button
              type="button"
              onClick={() => setCategorie(null)}
              aria-pressed={categorie === null}
              className={`puce-filtre ${
                categorie === null
                  ? 'border-ink-800 bg-ink-800 text-white'
                  : 'border-ink-300 bg-white text-ink-600'
              }`}
            >
              Tout
            </button>
            {ORDRE_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategorie(categorie === c ? null : c)}
                aria-pressed={categorie === c}
                className={`puce-filtre ${
                  categorie === c
                    ? 'border-ink-800 bg-ink-800 text-white'
                    : 'border-ink-300 bg-white text-ink-600'
                }`}
              >
                {CATEGORIES[c].libelle}
              </button>
            ))}
          </div>

            <div className="mt-1.5 flex justify-end">
              <label className="flex items-center gap-1.5 text-xs text-ink-500">
                Trier
                <select
                  value={tri}
                  onChange={(e) => setTri(e.target.value as Tri)}
                  className="min-h-9 rounded-lg border border-ink-300 bg-white px-2 text-xs text-ink-800"
                >
                  <option value="alpha">A → Z</option>
                  <option value="frequence">Le plus dit</option>
                  <option value="region">Par région</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {groupe && (
          <p className="mt-3 text-[13px] leading-relaxed text-ink-600">
            Vocabulaire propre à cette région. Les termes qui valent pour tout le
            corps — aplomb, méplat, relief, orientations — restent sous{' '}
            <button
              type="button"
              onClick={() => setGroupe(null)}
              className="text-brand-700 underline underline-offset-2"
            >
              Tout le corps
            </button>
            .
          </p>
        )}

        {categorie && (
          <p className="mt-3 text-[13px] leading-relaxed text-ink-600">
            {CATEGORIES[categorie].propos}
          </p>
        )}

        {resultats.length === 0 ? (
          <p className="mt-8 text-[15px] leading-relaxed text-ink-600">
            Aucun terme ne correspond à « {requete} ». La recherche accepte les
            synonymes et la nomenclature savante : « scapula » trouve l'omoplate,
            « patella » la rotule.
          </p>
        ) : groupes ? (
          <div className="mt-4 space-y-6">
            {groupes.map(([region, termes]) => (
              <section key={region}>
                <h2 className="titre sticky top-[13.5rem] z-10 bg-ink-50/95 py-1.5 text-sm tracking-wide text-ink-500 uppercase backdrop-blur">
                  {REGIONS[region] ?? region}
                </h2>
                <div className="mt-1.5 space-y-2">
                  {termes.map((t) => (
                    <CarteTerme key={t.id} terme={t} onLire={setLecture} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {resultats.map((t) => (
              <CarteTerme
                key={t.id}
                terme={t}
                /* Un seul résultat : il n'y a rien à choisir, on déplie. */
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
