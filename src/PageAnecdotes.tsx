import { useMemo, useState } from 'react';
import { Entete, Pied } from './components/Cadre';
import { Lecteur, type Lecture } from './components/Lecteur';
import {
  CATEGORIES,
  grouperParSeance,
  MOMENTS,
  ORDRE,
  type Categorie,
} from './lib/anecdotes';
import { ecrireTaille, grilleDe, lireTaille, type TailleLecteur } from './lib/lecteur';
import { duree, horodate, lienYoutube } from './lib/lexique';

/**
 * Les moments où le cours sort de son sujet.
 *
 * Page volontairement prudente. On ne sait pas ce qui se dit à ces
 * instants-là : les sous-titres ne notent aucun rire, le repérage est lexical,
 * et la reconnaissance vocale fabrique des mots crus là où Debord parle de
 * graticule. On donne donc des points d'écoute et le mot qui les a fait
 * remonter — à l'auditeur de juger, ce que personne ne peut faire à sa place.
 */
export function PageAnecdotes() {
  const [categorie, setCategorie] = useState<Categorie | null>(null);
  const [masquerDouteux, setMasquerDouteux] = useState(false);
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [taille, setTaille] = useState<TailleLecteur>(lireTaille);

  function reglerTaille(t: TailleLecteur) {
    setTaille(t);
    ecrireTaille(t);
  }

  const groupes = useMemo(() => {
    const filtres = MOMENTS.filter(
      (m) => (!categorie || m.categorie === categorie) && !(masquerDouteux && m.douteux),
    );
    return grouperParSeance(filtres);
  }, [categorie, masquerDouteux]);

  const total = groupes.reduce((s, g) => s + g.moments.length, 0);
  const douteux = MOMENTS.filter((m) => m.douteux).length;

  return (
    <>
      <Entete chemin="/anecdotes/" />

      <main className="mx-auto max-w-4xl px-4 pb-16 lg:max-w-6xl">
        <h1 className="titre mt-4 text-xl leading-tight text-ink-900 sm:mt-6 sm:text-3xl">
          Quand le cours sort de son sujet
        </h1>
        <p className="mt-3 hidden text-[15px] leading-relaxed text-ink-700 sm:block">
          Debord digresse : un souvenir d'atelier, une rencontre, un mot plus vert
          que les autres. {MOMENTS.length} moments repérés dans {groupes.length}{' '}
          séances — des points d'écoute, pas un florilège.
        </p>

        {/* La réserve est en tête et non en note de bas de page : elle change la
            façon de lire toute la liste, et une mise en garde qu'on découvre
            après coup ne sert à rien. */}
        <div className="mt-4 rounded-[var(--radius-card)] border border-os-200 bg-os-50 px-4 py-3 text-[13px] leading-relaxed text-ink-700">
          <b className="font-semibold text-ink-900">Relevé non vérifié.</b> Les
          sous-titres ne notent aucun rire : il n'existe aucun signal automatique
          d'une plaisanterie. Ce repérage est lexical, et la reconnaissance vocale
          se trompe souvent — elle écrit « gratte-cul » là où Debord dit{' '}
          <i>graticule</i>, le carroyage du dessinateur. Les {douteux} repères
          signalés <span className="text-os-700">douteux</span> sont ceux dont la
          relecture a montré qu'ils viennent presque toujours d'une déformation.
          Rien ici ne dit ce qui se dit : il faut écouter.
        </div>

        <div className="rangee-filtres mt-4">
          <button
            type="button"
            onClick={() => setCategorie(null)}
            aria-pressed={categorie === null}
            className={`puce-filtre ${
              categorie === null
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-ink-300 bg-white text-ink-600'
            }`}
          >
            Tout
          </button>
          {ORDRE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategorie(categorie === c ? null : c)}
              aria-pressed={categorie === c}
              className={`puce-filtre ${
                categorie === c
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-ink-300 bg-white text-ink-600'
              }`}
            >
              {CATEGORIES[c].libelle}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setMasquerDouteux((v) => !v)}
            aria-pressed={masquerDouteux}
            className={`puce-filtre ${
              masquerDouteux
                ? 'border-ink-800 bg-ink-800 text-white'
                : 'border-ink-300 bg-white text-ink-600'
            }`}
          >
            Masquer les douteux
          </button>
        </div>

        {categorie && (
          <p className="mt-3 text-[13px] leading-relaxed text-ink-600">
            {CATEGORIES[categorie].propos}
          </p>
        )}

        <p className="tabular mt-3 text-xs text-ink-500">
          {total} moment{total > 1 ? 's' : ''} · {groupes.length} séance
          {groupes.length > 1 ? 's' : ''}
        </p>

        <div className={`mt-4 lg:grid lg:gap-8 ${grilleDe(taille)}`}>
          <div className="space-y-4">
            {groupes.map(({ seance, moments }) => (
              <section key={seance.id} className="card px-4 py-3.5">
                <h2 className="text-[13px] leading-snug text-ink-700">
                  <span className="tabular text-ink-400">{seance.rang}.</span>{' '}
                  <a
                    href={lienYoutube(seance.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="titre text-[15px] text-ink-900 underline decoration-ink-300 underline-offset-2"
                  >
                    {seance.titre}
                  </a>{' '}
                  <span className="text-ink-400">({duree(seance.dureeS)})</span>
                </h2>

                <ul className="mt-2 flex flex-wrap gap-x-1.5 gap-y-1">
                  {moments.map((m) => (
                    <li key={m.t}>
                      <a
                        className="puce-temps"
                        href={lienYoutube(seance.id, m.t)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                          e.preventDefault();
                          setLecture({ videoId: seance.id, instant: m.t, titre: seance.titre });
                        }}
                      >
                        {horodate(m.t)}
                        {/* Le mot déclencheur est dit, jamais la phrase : il
                            annonce ce qu'on va chercher sans prêter de propos. */}
                        <span className={`ml-1.5 ${m.douteux ? 'text-os-700' : 'text-ink-400'}`}>
                          {m.mot}
                          {m.douteux ? ' ?' : ''}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <Lecteur
            lecture={lecture}
            onFermer={() => setLecture(null)}
            taille={taille}
            onTaille={reglerTaille}
          />
        </div>
      </main>

      <Pied />
    </>
  );
}
