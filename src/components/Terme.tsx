import { useState } from 'react';
import { CATEGORIES, REGIONS } from '../lib/couleurs';
import { placePourLecteur } from '../lib/ecran';
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
 * Une entrée du lexique : le mot, ce qu'il désigne, et où l'entendre.
 *
 * Repliée par défaut. Quatre-vingt-quinze définitions dépliées feraient un
 * document de plusieurs mètres à faire défiler au doigt ; replié, l'index tient
 * en quelques écrans et se parcourt comme une table.
 */
export function CarteTerme({
  terme,
  ouvertParDefaut,
  onLire,
}: {
  terme: TermeT;
  ouvertParDefaut?: boolean;
  /** Fourni par une page qui affiche un lecteur : sur grand écran, le clic y
   *  place la séance au lieu d'ouvrir un onglet. */
  onLire?: (l: Lecture) => void;
}) {
  const [ouvert, setOuvert] = useState(ouvertParDefaut ?? false);
  const cat = CATEGORIES[terme.categorie];
  const total = totalDe(terme.id);
  const passages = ouvert ? passagesDe(terme.id) : [];

  return (
    <article id={terme.id} className="card overflow-hidden">
      <h3>
        <button
          type="button"
          onClick={() => setOuvert((v) => !v)}
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
                /* Dire « non relevé » plutôt que rien : l'absence est une
                   information — soit Debord emploie un autre mot, soit la
                   transcription automatique l'a écorché. */
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
            <div className="mt-4">
              <p className="text-xs font-medium tracking-wide text-ink-500 uppercase">
                Où l'entendre
              </p>
              <ul className="mt-2 space-y-3">
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
                              // Reste un vrai lien : sans place pour le lecteur,
                              // avec un clic du milieu ou une touche de
                              // modification, le navigateur fait son travail
                              // habituel et l'on part sur YouTube.
                              if (!onLire || !placePourLecteur()) return;
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
              Aucun passage relevé. Le terme figure ici parce qu'il fait partie du
              vocabulaire de la région, mais la transcription automatique ne le
              restitue pas — voir la{' '}
              <a href="/methode/" className="text-brand-700 underline underline-offset-2">
                méthode
              </a>
              .
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
