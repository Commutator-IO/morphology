import { useState } from 'react';
import { CATEGORIES, REGIONS } from '../lib/couleurs';
import type { Lecture } from './Lecteur';
import {
  duree,
  horodate,
  lienYoutube,
  passagesDe,
  totalDe,
  type Terme as TermeT,
} from '../lib/lexique';

/**
 * A lexicon entry: the word, what it denotes, and where to hear it.
 *
 * Collapsed by default. A hundred definitions unfolded would make a document
 * metres long to thumb through; collapsed, the index fits a few screens and
 * reads like a table of contents.
 */
export function CarteTerme({
  terme,
  ouvertParDefaut,
  onLire,
  onOuvrir,
}: {
  terme: TermeT;
  ouvertParDefaut?: boolean;
  /** Tells the page this card has just been unfolded: the body plan on the
   *  right follows the last one opened. */
  onOuvrir?: (t: TermeT) => void;
  /** Provided by a page showing a player: on a large screen, a click loads the
   *  session there instead of opening a tab. */
  onLire?: (l: Lecture) => void;
}) {
  const [ouvert, setOuvert] = useState(ouvertParDefaut ?? false);
  // Passages stay folded inside an open card: what one came for is the
  // definition, and fifty timestamps laid under it push it off screen before it
  // has been read.
  const [passagesOuverts, setPassagesOuverts] = useState(false);
  const cat = CATEGORIES[terme.categorie];
  const total = totalDe(terme.id);
  const passages = ouvert ? passagesDe(terme.id) : [];

  return (
    <article id={terme.id} className="card overflow-hidden">
      <h3>
        <button
          type="button"
          onClick={() => {
            // Notify before toggling, and outside the updater function: that
            // one runs during render, where touching another component's state
            // is not allowed.
            if (!ouvert) onOuvrir?.(terme);
            setOuvert((v) => !v);
          }}
          aria-expanded={ouvert}
          className="flex w-full items-start gap-3 px-4 py-3.5 text-left active:bg-ink-50"
        >
          <span className="min-w-0 flex-1">
            <span className="titre block text-[17px] leading-tight text-ink-900">
              {terme.terme}
            </span>
            <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className={`rounded border px-1.5 py-0.5 font-medium ${cat.puce}`}>
                {cat.libelle}
              </span>
              <span className="text-ink-500">{REGIONS[terme.region] ?? terme.region}</span>
              {total > 0 ? (
                <span className="tabular text-ink-400">
                  {total} passage{total > 1 ? 's' : ''} · {passagesOuSeances(terme.id)}
                </span>
              ) : (
                /* Say "non relevé" rather than nothing: the absence is
                   information — either Debord uses another word, or the
                   automatic transcription mangled it. */
                <span className="text-ink-400">non relevé</span>
              )}
            </span>
          </span>
          <span aria-hidden="true" className="mt-1 shrink-0 text-lg leading-none text-ink-400">
            {ouvert ? '−' : '+'}
          </span>
        </button>
      </h3>

      {ouvert && (
        <div className="border-t border-ink-100 px-4 pt-3.5 pb-4">
          {(terme.moderne || terme.aussi) && (
            <p className="mb-2.5 text-[13px] leading-relaxed text-ink-500">
              {terme.moderne && (
                <>
                  Nomenclature : <i>{terme.moderne}</i>
                </>
              )}
              {terme.moderne && terme.aussi && ' · '}
              {terme.aussi && <>Aussi dit : {terme.aussi.join(', ')}</>}
            </p>
          )}

          <p className="text-[15px] leading-relaxed text-ink-800">{terme.definition}</p>

          {passages.length > 0 ? (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setPassagesOuverts((v) => !v)}
                aria-expanded={passagesOuverts}
                className="flex min-h-9 items-center gap-1.5 text-xs text-ink-500 active:text-ink-800"
              >
                Où l'entendre
                <span className="tabular text-ink-400">
                  {total} passage{total > 1 ? 's' : ''} · {passages.length} séance
                  {passages.length > 1 ? 's' : ''}
                </span>
                <span aria-hidden="true" className="text-ink-400">
                  {passagesOuverts ? '▴' : '▾'}
                </span>
              </button>
              <ul className={`mt-2 space-y-3 ${passagesOuverts ? '' : 'hidden'}`}>
                {passages.map(({ seance, instants }) => (
                  <li key={seance.id}>
                    <p className="text-[13px] leading-snug text-ink-700">
                      <span className="tabular text-ink-400">{seance.rang}.</span>{' '}
                      <a
                        href={lienYoutube(seance.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-ink-300 underline-offset-2"
                      >
                        {seance.titre}
                      </a>{' '}
                      <span className="text-ink-400">({duree(seance.dureeS)})</span>
                    </p>
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {instants.map((t) => (
                        <li key={t}>
                          <a
                            className="puce-temps"
                            href={lienYoutube(seance.id, t)}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => {
                              // Still a real link: with a middle click or a
                              // modifier key, the browser does its usual job and
                              // we leave for YouTube.
                              if (!onLire) return;
                              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                              e.preventDefault();
                              onLire({ videoId: seance.id, instant: t, titre: seance.titre });
                            }}
                          >
                            {horodate(t)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 text-[13px] leading-relaxed text-ink-500">
              Aucun passage relevé dans les séances. Le terme figure ici parce
              qu'il fait partie du vocabulaire de la région ; une absence ne
              prouve rien, et la{' '}
              <a href="/methode/" className="text-brand-700 underline underline-offset-2">
                méthode
              </a>{' '}
              dit pourquoi.
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function passagesOuSeances(id: string): string {
  const n = passagesDe(id).length;
  return `${n} séance${n > 1 ? 's' : ''}`;
}
