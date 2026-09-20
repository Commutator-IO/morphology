import { DOS, FACE, type Silhouette } from './silhouettes';
import type { Terme } from '../lib/lexique';

/**
 * Where the term sits on the body.
 *
 * The plan answers what a definition cannot when the word is still unknown: the
 * adductors, where are they? A mark on a silhouette says it at a glance, where
 * "inner face of the thigh" already assumes one can read "inner".
 *
 * The precision is that of a bare silhouette and no more: no construction lines
 * inside the outline, so the mark says "around there", not "exactly there".
 * Deep bones — sacrum, ischium, pubis — are shown in projection, where one
 * would look for them under the skin.
 *
 * Terms of orientation and form — aplomb, méplat, raccourci — are located
 * nowhere, and the card says so rather than inventing a place for them.
 */
export function Situation({ terme }: { terme: Terme }) {
  const s = terme.situation;
  if (!s) return null;
  const vue: Silhouette = s.vue === 'dos' ? DOS : FACE;

  return (
    <figure className="m-0">
      <svg
        viewBox={vue.boite}
        className="h-auto w-full"
        role="img"
        aria-label={`${terme.terme} : situation sur le corps, vue ${
          s.vue === 'dos' ? 'de dos' : 'de face'
        }`}
      >
        {vue.traces.map((t, i) => (
          <path
            key={i}
            d={t.d}
            transform={t.t}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.2}
            className="text-ink-300"
          />
        ))}
        {/* Les repères viennent après les tracés : ils se posent dessus. */}
        {s.traits?.map(([x1, y1, x2, y2], i) => (
          <line
            key={`t${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={2.6}
            strokeLinecap="round"
            className="text-brand-600"
          />
        ))}
        {s.taches?.map(([cx, cy, rx, ry], i) => (
          <ellipse
            key={`e${i}`}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            className="fill-brand-600/20 stroke-brand-600"
            strokeWidth={1.3}
          />
        ))}
      </svg>
      <figcaption className="mt-1 text-center text-[10px] tracking-[0.09em] text-ink-400 uppercase">
        {s.vue === 'dos' ? 'Dos' : 'Face'}
      </figcaption>
    </figure>
  );
}

/**
 * The body-plan panel, on the right under the player.
 *
 * It follows the last card opened rather than what is playing: one opens a term
 * to read it, and that is when one wants to know where it is — not when
 * starting a session.
 */
export function PanneauSituation({ terme }: { terme: Terme | null }) {
  return (
    <section className="card mt-4 hidden px-4 py-3.5 lg:block">
      <h2 className="text-[13px] font-medium text-ink-700">Sur le corps</h2>
      {terme?.situation ? (
        <div className="mt-2 flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="titre text-[15px] text-ink-900">{terme.terme}</p>
            {/* La réserve tient en une ligne : répétée à chaque terme, elle
                n'a pas à coûter trois lignes de hauteur à chaque fois. */}
            <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
              Repère approximatif, os profonds en projection.
            </p>
          </div>
          <div className="w-28 shrink-0">
            <Situation terme={terme} />
          </div>
        </div>
      ) : (
        <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
          {terme
            ? /* Tout ce qui a un lieu en a un : l'absence de repère est donc
                 une réponse, et non un placement qui resterait à faire. */
              `${terme.terme} ne se situe nulle part en particulier : c’est une manière de regarder, pas un endroit du corps.`
            : 'Ouvrez un terme : sa place sur le corps s’affiche ici.'}
        </p>
      )}
    </section>
  );
}
