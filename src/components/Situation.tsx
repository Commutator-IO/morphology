import { DOS, FACE, type Silhouette } from './silhouettes';
import type { Terme } from '../lib/lexique';

/**
 * Où le terme se trouve sur le corps.
 *
 * Le plan répond à la question que la définition ne règle pas quand on ne
 * connaît pas encore le mot : les adducteurs, c'est où ? Un repère sur une
 * silhouette le dit en un coup d'œil, là où « face interne de la cuisse »
 * suppose déjà qu'on sache lire « interne ».
 *
 * La précision est celle d'une silhouette nue, et pas davantage : aucune ligne
 * de construction à l'intérieur du contour, donc le repère dit « par là », pas
 * « exactement là ». Les os profonds — sacrum, ischion, pubis — sont montrés en
 * projection, à l'endroit où on les chercherait sous la peau.
 *
 * Les termes d'orientation et de morphologie — aplomb, méplat, raccourci — ne
 * sont situés nulle part, et la fiche le dit plutôt que de leur inventer une
 * place.
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
 * Le panneau du plan, à droite sous le lecteur.
 *
 * Il suit la dernière fiche ouverte plutôt que la lecture en cours : on ouvre
 * un terme pour le lire, et c'est à ce moment qu'on veut savoir où il est, pas
 * quand on lance une séance.
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
