import { useState } from 'react';
import { duree, horodate, lienYoutube } from '../lib/lexique';
import {
  passagesDeReference,
  totalDeReference,
  TYPES,
  type Reference as ReferenceT,
} from '../lib/references';
import type { Lecture } from './Lecteur';

/**
 * Une référence citée dans le cours, et les moments où elle l'est.
 *
 * Même forme repliée que les termes d'anatomie : on cherche un nom, on déplie,
 * on saute au passage. Ce qui change est le propos — ici, pourquoi Debord
 * convoque ce nom-là, et non ce que le mot désigne.
 */
export function CarteReference({
  reference,
  ouvertParDefaut,
  onLire,
}: {
  reference: ReferenceT;
  ouvertParDefaut?: boolean;
  onLire?: (l: Lecture) => void;
}) {
  const [ouvert, setOuvert] = useState(ouvertParDefaut ?? false);
  const t = TYPES[reference.type];
  const total = totalDeReference(reference.id);
  const passages = ouvert ? passagesDeReference(reference.id) : [];

  return (
    <article id={reference.id} className="card overflow-hidden">
      <h3>
        <button
          type="button"
          onClick={() => setOuvert((v) => !v)}
          aria-expanded={ouvert}
          className="flex w-full items-start gap-3 px-4 py-3.5 text-left active:bg-ink-50"
        >
          <span className="min-w-0 flex-1">
            <span className="titre block text-[17px] leading-tight text-ink-900">
              {reference.nom}
            </span>
            <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className={`rounded border px-1.5 py-0.5 font-medium ${t.puce}`}>
                {t.libelle}
              </span>
              {reference.dates && <span className="tabular text-ink-500">{reference.dates}</span>}
              <span className="tabular text-ink-400">
                {total} mention{total > 1 ? 's' : ''} · {passagesDeReference(reference.id).length}{' '}
                séance{passagesDeReference(reference.id).length > 1 ? 's' : ''}
              </span>
            </span>
          </span>
          <span aria-hidden="true" className="mt-1 shrink-0 text-lg leading-none text-ink-400">
            {ouvert ? '−' : '+'}
          </span>
        </button>
      </h3>

      {ouvert && (
        <div className="border-t border-ink-100 px-4 pt-3.5 pb-4">
          <p className="text-[15px] leading-relaxed text-ink-800">{reference.note}</p>

          <div className="mt-4">
            <p className="text-xs font-medium tracking-wide text-ink-500 uppercase">
              Où Debord en parle
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
                    {instants.map((i) => (
                      <li key={i}>
                        <a
                          className="puce-temps"
                          href={lienYoutube(seance.id, i)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => {
                            if (!onLire) return;
                            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                            e.preventDefault();
                            onLire({ videoId: seance.id, instant: i, titre: seance.titre });
                          }}
                        >
                          {horodate(i)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </article>
  );
}
