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
 * La page se lit comme une étude de son oralité, pas comme un florilège. Debord
 * enseigne de vive voix, deux heures durant et sans notes ; ces écarts sont ses
 * outils. Un souvenir d'atelier situe une pratique dans une histoire, un échange
 * avec la salle rattrape l'attention, un mot cru nomme une forme sans détour, et
 * les comparaisons prises hors de l'art — un sport, un animal, un geste
 * ordinaire — expliquent souvent une forme mieux qu'une planche.
 *
 * Chaque moment assez intelligible porte une notice de deux ou trois phrases,
 * écrite pour ce site. Les autres restent de simples points d'écoute : les
 * décrire supposerait de deviner, et deviner ce qu'a dit quelqu'un de réel
 * n'est pas une option.
 */
export function PageAnecdotes() {
  const [categorie, setCategorie] = useState<Categorie | null>(null);
  const [comparaisons, setComparaisons] = useState(false);
  const [decritsSeuls, setDecritsSeuls] = useState(true);
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [taille, setTaille] = useState<TailleLecteur>(lireTaille);

  function reglerTaille(t: TailleLecteur) {
    setTaille(t);
    ecrireTaille(t);
  }

  const groupes = useMemo(() => {
    const filtres = MOMENTS.filter(
      (m) =>
        (!categorie || m.categorie === categorie) &&
        (!comparaisons || m.comparaison) &&
        (!decritsSeuls || m.note),
    );
    return grouperParSeance(filtres);
  }, [categorie, comparaisons, decritsSeuls]);

  const total = groupes.reduce((s, g) => s + g.moments.length, 0);
  const decrits = MOMENTS.filter((m) => m.note).length;

  return (
    <>
      <Entete chemin="/anecdotes/" />

      <main className="mx-auto max-w-4xl px-4 pb-16 lg:max-w-6xl">
        <h1 className="titre mt-4 text-xl leading-tight text-ink-900 sm:mt-6 sm:text-3xl">
          Quand le cours sort de son sujet
        </h1>
{/* Le cadrage tient en une ligne sur téléphone : c'est la phrase qui dit
            ce qu'on lit, et la masquer laissait croire à un recueil de blagues.
            Le développement attend l'écran large, où la place ne manque pas. */}
        <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
          Debord enseigne de vive voix, sans notes : ces écarts sont ses outils,
          pas des parenthèses.
          <span className="hidden sm:inline">
            {' '}
            Un souvenir d'atelier situe une pratique, un échange avec la salle
            rattrape l'attention, une comparaison prise hors de l'art explique
            une forme mieux qu'une planche. {decrits} de ces moments sont décrits
            ici en deux ou trois phrases ; touchez l'horodatage pour aller les
            entendre.
          </span>
        </p>

        <div className="rangee-filtres mt-4">
          <button
            type="button"
            onClick={() => {
              setCategorie(null);
              setComparaisons(false);
              setDecritsSeuls(true);
            }}
            aria-pressed={categorie === null && !comparaisons}
            className={`puce-filtre ${
              categorie === null && !comparaisons
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
              onClick={() => {
                setCategorie(categorie === c ? null : c);
                setComparaisons(false);
              }}
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
          {/* Les comparaisons traversent les trois catégories : un sport peut
              venir dans un souvenir comme dans un échange avec la salle. */}
          <button
            type="button"
            onClick={() => {
              setComparaisons((v) => !v);
              setCategorie(null);
            }}
            aria-pressed={comparaisons}
            className={`puce-filtre ${
              comparaisons
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-ink-300 bg-white text-ink-600'
            }`}
          >
            Comparaisons hors art
          </button>
        </div>

        {/* Hors de la rangée de puces, et formulé comme un ajout.
            Posé parmi elles, cet interrupteur passait pour un cinquième filtre
            exclusif : on cliquait « Tout » et la liste restait tronquée, sans
            qu'on voie pourquoi. Une case à cocher dit ce qu'il est. */}
        <label className="mt-2.5 flex min-h-11 w-fit cursor-pointer items-center gap-2 text-[13px] text-ink-600">
          <input
            type="checkbox"
            checked={!decritsSeuls}
            onChange={(e) => setDecritsSeuls(!e.target.checked)}
            className="h-4 w-4 accent-brand-600"
          />
          Afficher aussi les {MOMENTS.length - decrits} moments non décrits
        </label>

        {comparaisons ? (
          <p className="mt-3 text-[13px] leading-relaxed text-ink-600">
            Debord y explique une forme par un domaine étranger à l'art — le
            volley-ball, la planche à voile, le cheval, le chat, un marteau mal
            tenu. Ce sont souvent les passages où l'anatomie devient la plus
            claire.
          </p>
        ) : (
          categorie && (
            <p className="mt-3 text-[13px] leading-relaxed text-ink-600">
              {CATEGORIES[categorie].propos}
            </p>
          )
        )}

        <p className="tabular mt-3 text-xs text-ink-500">
          {total} moment{total > 1 ? 's' : ''} · {groupes.length} séance
          {groupes.length > 1 ? 's' : ''}
          {!decritsSeuls && ' · les moments sans notice sont de simples repères'}
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

                <ul className="mt-2.5 space-y-2.5">
                  {moments.map((m) => (
                    <li key={m.t} className="flex items-start gap-2.5">
                      <a
                        className="puce-temps mt-px shrink-0"
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
                      </a>
                      {m.note ? (
                        <p className="text-[14px] leading-relaxed text-ink-800">
                          {m.note}
                          {m.comparaison && (
                            <span className="ml-1.5 rounded border border-os-200 bg-os-50 px-1.5 py-0.5 align-middle text-[11px] text-os-700">
                              hors art
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="mt-2 text-[13px] text-ink-400">{m.mot}</p>
                      )}
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
