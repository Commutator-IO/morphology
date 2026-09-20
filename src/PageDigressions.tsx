import { useMemo, useState } from 'react';
import { Entete, Pied } from './components/Cadre';
import { Lecteur, type Lecture } from './components/Lecteur';
import { CATEGORIES, MOMENTS, ORDRE, type Categorie } from './lib/anecdotes';
import { grilleDe } from './lib/lecteur';
import { horodate, lienYoutube, SEANCE_PAR_ID } from './lib/lexique';

/**
 * The moments where the course leaves its subject.
 *
 * The page reads as a study of his speech, not as a garland. Debord teaches out
 * loud, two hours at a time and without notes; these departures are his tools. A
 * studio memory places a practice in a history, an exchange with the room
 * recovers attention, a blunt word names a form without detour, and comparisons
 * drawn from outside art — a sport, an animal, an everyday gesture — often
 * explain a form better than a plate.
 *
 * Every moment intelligible enough carries a two- or three-sentence note written
 * for this site. The rest stay plain listening points: describing them would
 * mean guessing, and guessing what a real person said is not an option.
 */
export function PageDigressions() {
  const [categorie, setCategorie] = useState<Categorie | null>(null);
  const [comparaisons, setComparaisons] = useState(false);
  const [decritsSeuls, setDecritsSeuls] = useState(true);
  const [lecture, setLecture] = useState<Lecture | null>(null);

  // A flat list rather than sections by session. Each moment stands on its own
  // — it is read for what Debord says there, not for the session it falls in —
  // and grouping them left a column of headings carrying one line each. The
  // session is still named on every row, small, for whoever wants to place it.
  const liste = useMemo(
    () =>
      MOMENTS.filter(
        (m) =>
          (!categorie || m.categorie === categorie) &&
          (!comparaisons || m.comparaison) &&
          (!decritsSeuls || m.note),
      )
        .map((m) => ({ ...m, seance: SEANCE_PAR_ID.get(m.video)! }))
        .filter((m) => m.seance)
        .sort((a, b) => a.seance.rang - b.seance.rang || a.t - b.t),
    [categorie, comparaisons, decritsSeuls],
  );

  const total = liste.length;
  const seances = new Set(liste.map((m) => m.video)).size;
  const decrits = MOMENTS.filter((m) => m.note).length;

  return (
    <>
      <Entete chemin="/digressions/" />

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
            entendre. Les autres n'ont qu'un mot pour description : deux
            tournures reviennent d'une séance à l'autre — l'adresse à la salle
            et le mot cru pour nommer une forme — et ce sont sa signature plus
            que des écarts.
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
          {total} moment{total > 1 ? 's' : ''} · {seances} séance
          {seances > 1 ? 's' : ''}
          {!decritsSeuls && ' · les moments sans notice sont de simples repères'}
        </p>

        <div className={`mt-4 lg:grid lg:gap-8 ${grilleDe('petite')}`}>
          {/* A fixed first column from sm up: the chips are not all the same
              width — "S3 · 11:43" against "S43 · 1:43:24" — and left to
              themselves they pushed every note to a different indent. On a
              phone the chip sits above instead: seven rem out of a narrow
              screen would cost the text more than the alignment is worth. */}
          <ul className="space-y-2">
            {liste.map((m) => (
              <li
                key={`${m.video}|${m.t}`}
                className="card grid items-start gap-y-0.5 px-3.5 py-3 sm:grid-cols-[7rem_1fr] sm:gap-x-3 sm:gap-y-0"
              >
                <a
                  className="puce-temps mt-px justify-start"
                  href={lienYoutube(m.video, m.t)}
                  target="_blank"
                  rel="noreferrer"
                  title={m.seance.titre}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    setLecture({ videoId: m.video, instant: m.t, titre: m.seance.titre });
                  }}
                >
                  <span className="tabular text-ink-400">S{m.seance.rang}</span>
                  <span className="mx-1 text-ink-300">·</span>
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
                  <p className="mt-1 text-[13px] text-ink-400">{m.mot}</p>
                )}
              </li>
            ))}
          </ul>

          {/* Fixed small, with no setting offered: the notes are read in one
              column, and a wide player leaves nothing of the list. */}
          <Lecteur lecture={lecture} onFermer={() => setLecture(null)} />
        </div>
      </main>

      <Pied />
    </>
  );
}
