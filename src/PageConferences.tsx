import { useEffect, useMemo, useState } from 'react';
import { Entete, Pied } from './components/Cadre';
import { LecteurAudio, type LectureAudio } from './components/LecteurAudio';
import {
  annee,
  COLLECTION,
  CONFERENCES,
  dateLongue,
  duree,
  GROUPES_THEMES,
  horodatage,
  lienMp3,
  lienNotice,
  lireAncre,
  nombreDeConferences,
  passagesDe,
  plier,
  REPEREES,
  THEMES,
  type Conference,
} from './lib/conferences';

function lectureDe(c: Conference, instant = 0): LectureAudio {
  return { id: c.id, titre: c.titre, src: lienMp3(c), notice: lienNotice(c), instant };
}

/** A title matches when it contains the search, accents and case aside. */
const correspond = (c: Conference, q: string) => !q || plier(c.titre).includes(q);

/** How many moments of a lecture are shown before "see the others". */
const APERCU = 8;

/**
 * The lectures of the École des Beaux-Arts, by year or by theme.
 *
 * The sound comes from Bibnum and is never copied here. The page lists, filters
 * and plays; the text of the recordings is not published. A theme leads to the
 * moments where it comes up, each one opening the player at that point.
 */
export function PageConferences() {
  const [lecture, setLecture] = useState<LectureAudio | null>(null);
  const [recherche, setRecherche] = useState('');
  const [theme, setTheme] = useState<string | null>(null);
  const [deplie, setDeplie] = useState<Set<string>>(new Set());

  // A link such as /conferences/#2nhq0@754 opens that lecture at that moment.
  useEffect(() => {
    const ouvrir = () => {
      const ancre = lireAncre(window.location.hash);
      const c = ancre && CONFERENCES.find((x) => x.id === ancre.id);
      if (c && ancre) setLecture(lectureDe(c, ancre.instant));
    };
    ouvrir();
    window.addEventListener('hashchange', ouvrir);
    return () => window.removeEventListener('hashchange', ouvrir);
  }, []);

  const total = CONFERENCES.reduce((s, c) => s + c.dureeS, 0);
  const q = plier(recherche.trim());

  const annees = useMemo(() => {
    const parAnnee = new Map<string, Conference[]>();
    for (const c of [...CONFERENCES].filter((c) => correspond(c, q)).sort((a, b) => a.date.localeCompare(b.date))) {
      const a = annee(c);
      parAnnee.set(a, [...(parAnnee.get(a) ?? []), c]);
    }
    return [...parAnnee.entries()];
  }, [q]);

  const passages = useMemo(
    () => (theme ? passagesDe(theme).filter((p) => correspond(p.conference, q)) : []),
    [theme, q],
  );

  const themeChoisi = THEMES.find((t) => t.id === theme);
  const nombre = theme ? passages.length : annees.reduce((s, [, l]) => s + l.length, 0);

  return (
    <>
      <Entete chemin="/conferences/" />

      <main className="mx-auto max-w-4xl lg:max-w-6xl px-4 pb-16">
        <h1 className="titre mt-4 text-xl leading-tight text-ink-900 sm:mt-6 sm:text-3xl">
          Conférences des Beaux-Arts de Paris
        </h1>
        <p className="mt-3 hidden text-[15px] leading-relaxed text-ink-700 sm:block">
          {CONFERENCES.length} enregistrements de l'École des Beaux-Arts, soit environ{' '}
          {Math.round(total / 3600)} heures : rencontres avec des artistes, séminaires,
          colloques. Ils ont été numérisés par l'Université PSL, qui les conserve.
        </p>
        <p className="mt-2 hidden text-[13px] leading-relaxed text-ink-500 sm:block">
          Le son n'est pas copié ici : il est lu depuis le catalogue de PSL, et chaque
          conférence renvoie à sa notice. Droits réservés aux artistes et à l'École.{' '}
          <a
            href={COLLECTION}
            target="_blank"
            rel="noreferrer"
            className="text-brand-700 underline underline-offset-2"
          >
            La collection sur Bibnum ↗
          </a>
        </p>

        <div className="mt-4 space-y-3 sm:mt-5">
          {GROUPES_THEMES.map((g) => (
            <div key={g.id}>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-400">
                {g.libelle}
              </p>
              <div className="rangee-filtres">
                {THEMES.filter((t) => t.groupe === g.id).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(theme === t.id ? null : t.id)}
                    aria-pressed={theme === t.id}
                    className={`puce-filtre ${
                      theme === t.id
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-ink-300 bg-white text-ink-600'
                    }`}
                  >
                    {t.terme}
                    <span className="tabular opacity-60"> {nombreDeConferences(t.id)}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="sr-only" htmlFor="recherche-conferences">
            Chercher dans les titres
          </label>
          <input
            id="recherche-conferences"
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Chercher un nom, un titre…"
            className="min-h-11 w-full rounded-lg border border-ink-300 bg-white px-3 text-[16px] text-ink-900 placeholder:text-ink-400 sm:max-w-md"
          />
          <p className="tabular mt-2 text-xs text-ink-400">
            {nombre} conférence{nombre > 1 ? 's' : ''}
            {theme ? '' : ` · ${REPEREES.size} avec des repères par thème`}
          </p>
        </div>

        <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
          {themeChoisi ? (
            <div>
              <h2 className="titre text-xl leading-tight text-ink-900">{themeChoisi.terme}</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
                Les moments où le mot revient, relevés dans la parole : un repère ouvre
                l'enregistrement quelques secondes avant.{' '}
                <a href="/methode/" className="text-brand-700 underline underline-offset-2">
                  Comment ils sont relevés
                </a>
                .
              </p>
              {passages.length === 0 && (
                <p className="mt-4 text-[15px] text-ink-600">Aucun titre ne correspond.</p>
              )}
              <ul className="mt-4 space-y-2">
                {passages.map(({ conference: c, instants }) => {
                  const cle = `${themeChoisi.id}-${c.id}`;
                  const tous = deplie.has(cle);
                  const montres = tous ? instants : instants.slice(0, APERCU);
                  return (
                    <li key={c.id} className="card px-4 py-3.5">
                      <p className="titre text-[16px] leading-snug text-ink-900">{c.titre}</p>
                      <p className="tabular mt-1 text-xs text-ink-400">
                        {dateLongue(c.date)} · {duree(c.dureeS)} · {instants.length} passage
                        {instants.length > 1 ? 's' : ''}
                      </p>
                      <p className="mt-2 flex flex-wrap gap-1.5">
                        {montres.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setLecture(lectureDe(c, t))}
                            className="tabular min-h-11 min-w-14 rounded-lg border border-ink-300 bg-white px-2.5 text-sm text-ink-700 transition active:bg-ink-100"
                          >
                            {horodatage(t)}
                          </button>
                        ))}
                        {!tous && instants.length > APERCU && (
                          <button
                            type="button"
                            onClick={() => setDeplie(new Set(deplie).add(cle))}
                            className="min-h-11 px-2 text-sm text-brand-700 underline underline-offset-2"
                          >
                            +{instants.length - APERCU}
                          </button>
                        )}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="space-y-8">
              {annees.length === 0 && (
                <p className="text-[15px] text-ink-600">Aucun titre ne correspond.</p>
              )}
              {annees.map(([an, liste]) => (
                <section key={an} id={`a${an}`} className="scroll-mt-32">
                  <h2 className="titre text-xl leading-tight text-ink-900">{an}</h2>
                  <ul className="mt-3 space-y-2">
                    {liste.map((c) => (
                      <li key={c.id} className="card px-4 py-3.5">
                        <a
                          href={lienNotice(c)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-h-11 flex-col justify-center"
                          onClick={(e) => {
                            // A modified click stays ordinary navigation to the record.
                            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                            e.preventDefault();
                            setLecture(lectureDe(c));
                          }}
                        >
                          <span className="titre block text-[16px] leading-snug text-ink-900">
                            {c.titre}
                          </span>
                          <span className="tabular mt-1 block text-xs text-ink-400">
                            {dateLongue(c.date)} · {duree(c.dureeS)} · écouter
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          <LecteurAudio lecture={lecture} onFermer={() => setLecture(null)} />
        </div>
      </main>

      <Pied />
    </>
  );
}
