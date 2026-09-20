import { useEffect, useMemo, useState } from 'react';
import { Entete, Pied } from './components/Cadre';
import { useAncre } from './lib/ancre';
import { Lecteur, type Lecture } from './components/Lecteur';
import { ecrireTaille, grilleDe, lireTaille, type TailleLecteur } from './lib/lecteur';
import { CarteTerme } from './components/Terme';
import { PanneauSituation } from './components/Situation';
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
import {
  correspond,
  LEXIQUE,
  parAlphabet,
  SEANCES,
  totalDe,
  type Terme,
} from './lib/lexique';

/**
 * The vocabulary index — the page one opens in class.
 *
 * Everything is built for a phone held in one hand: search and filters stay
 * stuck to the top, cards are collapsed, and nothing touchable falls under 44 px
 * high. The default sort is alphabetical because people arrive looking for a
 * precise word, not browsing a classification.
 */

type Tri = 'alpha' | 'frequence' | 'region';

export function PageVocabulaire() {
  const [requete, setRequete] = useState('');
  const [categorie, setCategorie] = useState<Categorie | null>(null);
  // Body region is the most useful filter after a studio session: one arrives
  // knowing one worked on hands, not looking for a word.
  const [groupe, setGroupe] = useState<string | null>(null);
  const [tri, setTri] = useState<Tri>('alpha');
  // On a large screen the session plays on the right; on a phone this panel is
  // not rendered and the state simply stays null.
  const [lecture, setLecture] = useState<Lecture | null>(null);
  // The last card unfolded, whose place the body plan shows on the right. We
  // follow unfolding rather than playback: one wants to know where a term is when
  // reading it, not when starting a session.
  const [situe, setSitue] = useState<Terme | null>(null);
  const cible = useAncre();
  // The split between text and video is adjustable, and remembered: nobody wants
  // to set it again for every term.
  const [taille, setTaille] = useState<TailleLecteur>(lireTaille);

  function reglerTaille(t: TailleLecteur) {
    setTaille(t);
    ecrireTaille(t);
  }
  // Collapsed by default on a phone: this site is opened to find a word in a few
  // seconds, not to set filters.
  const [filtresOuverts, setFiltresOuverts] = useState(() => {
    // The choice carries from visit to visit: someone who likes seeing their
    // filters should not have to reopen them every time. Guarded read — in private
    // browsing, touching storage can throw.
    try {
      return localStorage.getItem('morpho.filtres') === 'ouverts';
    } catch {
      return false;
    }
  });

  /**
   * A deliberate fold is remembered; a circumstantial one is not. Hence writing
   * here, on the gesture, rather than in an effect that could not tell them
   * apart.
   */
  function basculerFiltres() {
    const ouverts = !filtresOuverts;
    setFiltresOuverts(ouverts);
    try {
      localStorage.setItem('morpho.filtres', ouverts ? 'ouverts' : 'replies');
    } catch {
      /** storage unavailable: folding still works, it just does not survive. */
    }
  }

  // Starting a passage means the search is over: on a phone the filters fold away
  // to give their room back to the list and the player, which now share the
  // screen. The button reopens them with one tap, and the choice is not
  // remembered — it is circumstance, not preference. From lg up nothing moves:
  // there is room to spare, and folding under the reader's eyes would be
  // gratuitous.
  useEffect(() => {
    if (!lecture) return;
    if (window.matchMedia('(min-width: 1024px)').matches) return;
    setFiltresOuverts(false);
  }, [lecture]);

  /**
   * A session is playing on a phone: the toolbar shrinks to one line — the result
   * count disappears and moves onto the search field's line, with the filter
   * button. Between that bar and the player anchored at the bottom, only a third
   * of a screen of list was left. The header hides itself as one scrolls: that is
   * `Entete`'s business, on every page.
   */
  const enLecture = lecture !== null;

  const resultats = useMemo(() => {
    const filtres = LEXIQUE.filter(
      (t) =>
        (!categorie || t.categorie === categorie) &&
        (!groupe || groupeDeRegion(t.region) === groupe) &&
        correspond(t, requete),
    );
    if (tri === 'frequence') {
      return [...filtres].sort(
        (a, b) => totalDe(b.id) - totalDe(a.id) || parAlphabet(a, b),
      );
    }
    if (tri === 'region') {
      return [...filtres].sort(
        (a, b) =>
          ORDRE_REGIONS.indexOf(a.region) - ORDRE_REGIONS.indexOf(b.region) ||
          parAlphabet(a, b),
      );
    }
    return [...filtres].sort(parAlphabet);
  }, [requete, categorie, groupe, tri]);

  // Sorted by region, entries are broken up by a subheading: without it, a list
  // sorted for no visible reason reads as a list in disorder.
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

  /** What the button announces when everything is collapsed. */
  const filtresActifs = [
    groupe ? GROUPE_PAR_ID.get(groupe)?.libelle : null,
    categorie ? CATEGORIES[categorie].libelle : null,
  ].filter((x): x is string => Boolean(x));

  const passagesTotal = useMemo(() => LEXIQUE.reduce((s, t) => s + totalDe(t.id), 0), []);

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
        {/* Une seule ligne, et le mode d'emploi en moins : le cartouche du
            lecteur, à droite, explique déjà ce que fait un horodatage, et
            deux paragraphes repoussaient la liste d'une centaine de pixels
            — soit deux fiches de moins à l'écran. */}
        <p className="mt-2 hidden text-[13px] leading-relaxed text-ink-500 sm:block">
          {LEXIQUE.length} termes, {passagesTotal.toLocaleString('fr-FR')} passages dans{' '}
          {SEANCES.length} séances, environ{' '}
          {Math.round(SEANCES.reduce((s, x) => s + (x.dureeS ?? 0), 0) / 3600)} heures de
          cours. Repérage automatique : lisez la{' '}
          <a href="/methode/" className="text-brand-700 underline underline-offset-2">
            méthode
          </a>{' '}
          pour savoir ce qu'il vaut.
        </p>

        {/* Barre d'outils collante, posée juste sous l'en-tête : `--haut-entete`
            dit ce que celui-ci occupe, et vaut zéro quand il s'est effacé — la
            barre monte alors d'un bloc au lieu d'ouvrir une bande vide. */}
        <div className={`lg:grid lg:gap-8 ${grilleDe(taille)}`}>
          <div>
            <div
              className={`sticky top-[var(--haut-entete)] z-20 -mx-4 mt-3 border-b border-ink-200/70 bg-ink-50/95 px-4 backdrop-blur sm:mt-5 lg:mx-0 lg:px-0 lg:pt-3 lg:pb-2.5 ${
                enLecture ? 'pt-2 pb-2' : 'pt-3 pb-2.5'
              }`}
            >
              <label className="sr-only" htmlFor="recherche">
                Chercher un terme
              </label>
              {/* Dès lg, le compte et le bouton des filtres passent à droite du
              champ au lieu de s'empiler dessous : la place horizontale est
              libre, et la ligne gagnée rend une fiche de plus visible. */}
              <div
                className={`lg:flex lg:items-center lg:gap-3 ${
                  enLecture ? 'flex items-center gap-2' : ''
                }`}
              >
                <div className={`relative lg:flex-1 ${enLecture ? 'min-w-0 flex-1' : ''}`}>
                  <input
                    id="recherche"
                    type="search"
                    value={requete}
                    onChange={(e) => setRequete(e.target.value)}
                    placeholder="deltoïde, omoplate, aplomb…"
                    autoComplete="off"
                    /* text-base rather than text-sm: under 16 px, iOS zooms when
                   the field takes focus and shifts the whole page. */
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
                <div
                  className={`flex items-center gap-3 lg:mt-0 lg:shrink-0 lg:justify-end ${
                    enLecture ? 'shrink-0' : 'mt-1.5 justify-between'
                  }`}
                >
                  <p
                    className={`tabular text-xs text-ink-500 ${enLecture ? 'hidden lg:block' : ''}`}
                  >
                    {resultats.length} terme{resultats.length > 1 ? 's' : ''}
                  </p>
                  <button
                    type="button"
                    onClick={basculerFiltres}
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
                <div className="lg:flex lg:items-center lg:gap-3">
                  <div className="rangee-filtres mt-1.5 lg:flex-1">
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

                  <div className="mt-1.5 flex justify-end lg:mt-1.5 lg:shrink-0">
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
            </div>

            {groupe && (
              <p className="mt-3 text-[13px] leading-relaxed text-ink-600">
                Les termes valables partout — aplomb, méplat, relief — sont sous{' '}
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
                synonymes et la nomenclature savante : « scapula » trouve l'omoplate, «
                patella » la rotule.
              </p>
            ) : groupes ? (
              <div className="mt-4 space-y-6">
                {groupes.map(([region, termes]) => (
                  <section key={region}>
                    <h2
                      /* The subheading sticks under the toolbar: the header's
                     height plus the bar's — which differs depending on whether
                     a session is playing. */
                      className={`titre sticky z-10 bg-ink-50/95 py-1.5 text-sm tracking-wide text-ink-500 uppercase backdrop-blur lg:top-[13.5rem] ${
                        enLecture
                          ? 'top-[calc(var(--haut-entete)+4rem)]'
                          : 'top-[calc(var(--haut-entete)+7.75rem)]'
                      }`}
                    >
                      {REGIONS[region] ?? region}
                    </h2>
                    <div className="mt-1.5 space-y-2">
                      {termes.map((t) => (
                        <CarteTerme
                          key={t.id}
                          terme={t}
                          ouvertParDefaut={t.id === cible}
                          onLire={setLecture}
                          onOuvrir={setSitue}
                        />
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
                    /* One result only: there is nothing to choose, so it
                   unfolds. A card targeted by an anchor unfolds too. */
                    ouvertParDefaut={t.id === cible || resultats.length === 1}
                    onLire={setLecture}
                    onOuvrir={setSitue}
                  />
                ))}
              </div>
            )}
          </div>

          <Lecteur
            lecture={lecture}
            onFermer={() => setLecture(null)}
            taille={taille}
            onTaille={reglerTaille}
            dessous={<PanneauSituation terme={situe} />}
          />
        </div>
      </main>

      <Pied />
    </>
  );
}
