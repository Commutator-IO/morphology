import { lienYoutube } from '../lib/lexique';

/** Ce que le panneau joue : une séance, à un instant. */
export type Lecture = { videoId: string; instant: number; titre: string };

/**
 * Lecteur embarqué, à droite de la liste, sur grand écran seulement.
 *
 * Le propos : sur un ordinateur, on consulte l'index et la vidéo en même temps.
 * Toucher un horodatage y place la séance au bon endroit sans quitter la page,
 * si bien qu'on peut suivre un muscle de séance en séance sans perdre sa liste.
 * Sur un téléphone, il n'y a pas la place de faire les deux : le lien part alors
 * sur YouTube, où l'application native lit mieux que n'importe quel iframe.
 */
export function Lecteur({ lecture, onFermer }: { lecture: Lecture | null; onFermer: () => void }) {
  return (
    <aside className="hidden lg:block">
      {/* `top-24` dégage l'en-tête collant ; le panneau suit le défilement de la
          liste pour rester en vue quel que soit le terme qu'on parcourt. */}
      <div className="sticky top-24">
        {lecture ? (
          <div className="card overflow-hidden">
            <div className="aspect-video w-full bg-ink-900">
              <iframe
                /* `key` force le remplacement de l'iframe à chaque changement
                   d'instant : YouTube ne relit pas `start` sur une même iframe,
                   et sans cela le second horodatage ne déplacerait rien. */
                key={`${lecture.videoId}-${lecture.instant}`}
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${lecture.videoId}?start=${lecture.instant}&autoplay=1&rel=0`}
                title={lecture.titre}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="px-3.5 py-3">
              <p className="titre text-[15px] leading-snug text-ink-900">{lecture.titre}</p>
              <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                <a
                  href={lienYoutube(lecture.videoId, lecture.instant)}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 transition hover:text-ink-900"
                >
                  Ouvrir sur YouTube ↗
                </a>
                <button
                  type="button"
                  onClick={onFermer}
                  className="underline underline-offset-2 transition hover:text-ink-900"
                >
                  Fermer le lecteur
                </button>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-400">
                Le lecteur démarre quelques secondes avant la mention. Debord
                annonce souvent une forme avant d'y venir : au besoin, reculez.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-[var(--radius-card)] border border-dashed border-ink-300 px-4 py-6 text-sm leading-relaxed text-ink-500">
            <p className="titre text-[15px] text-ink-700">Le lecteur s'ouvrira ici</p>
            <p className="mt-1.5">
              Cliquez un horodatage : la séance se place à cet endroit sans quitter
              l'index, et vous gardez votre liste sous les yeux.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
