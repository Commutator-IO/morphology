import { useEffect, type ReactNode } from 'react';
import { TAILLES, type TailleLecteur } from '../lib/lecteur';

/** What the panel plays: a session, at a moment. */
export type Lecture = { videoId: string; instant: number; titre: string };

/**
 * Embedded player.
 *
 * On a large screen it sits in a sticky panel to the right of the list: you
 * read the index and watch the session at once, and follow a muscle from
 * session to session without losing your place. On a phone it anchors to the
 * bottom, above the list that keeps scrolling — same idea, less room.
 *
 * Playing in the page rather than leaving for YouTube has a precise reason:
 * once on YouTube we can propose nothing more, stop nothing, and offer no way
 * back to the index. Anyone preferring the app gets there through the player's
 * own logo, bottom right of the picture; doubling it with a link of ours only
 * took the title's place.
 */
export function Lecteur({
  lecture,
  onFermer,
  taille,
  onTaille,
  dessous,
}: {
  lecture: Lecture | null;
  onFermer: () => void;
  /** Panel width against the text; absent, no setting is offered. */
  taille?: TailleLecteur;
  onTaille?: (t: TailleLecteur) => void;
  /** What follows the player in the right column, inside the sticky block so
   *  it stays on screen with it. That content must hide itself below lg: there
   *  the player is anchored to the bottom and has nothing under it. */
  dessous?: ReactNode;
}) {
  useEffect(() => {
    if (!lecture) return;
    const auClavier = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFermer();
    };
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [lecture, onFermer]);

  if (!lecture) {
    // Nothing to play: on a large screen we show the room the player will take,
    // on a phone we show nothing rather than an empty band at the bottom.
    return (
      <aside className="hidden lg:block">
        <div className="sticky top-[6.5rem]">
          <div className="rounded-[var(--radius-card)] border border-dashed border-ink-300 px-4 py-6 text-sm leading-relaxed text-ink-500">
            <p className="titre text-[15px] text-ink-700">Le lecteur s'ouvrira ici</p>
            <p className="mt-1.5">
              Cliquez un horodatage : la séance se place à cet endroit sans quitter l'index,
              et vous gardez votre liste sous les yeux.
            </p>
          </div>
          {dessous}
        </div>
      </aside>
    );
  }

  return (
    <aside>
      {/* Ancré en bas sur téléphone, collant à droite dès lg. `lg:sticky` passe
          après `fixed` : à partir de lg, c'est lui qui l'emporte. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white shadow-[0_-8px_24px_-12px_rgb(27_24_19/0.25)] lg:sticky lg:inset-x-auto lg:bottom-auto lg:top-[6.5rem] lg:z-auto lg:border lg:border-ink-200/70 lg:shadow-none">
        <div className="card overflow-hidden rounded-none border-0 shadow-none lg:rounded-[var(--radius-card)]">
          <div className="aspect-video w-full bg-ink-900">
            <iframe
              /* `key` forces the iframe to be replaced on every change of
                 moment: YouTube does not re-read `start` on the same iframe, so
                 without this the second timestamp would move nothing. */
              key={`${lecture.videoId}-${lecture.instant}`}
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${lecture.videoId}?start=${lecture.instant}&autoplay=1&rel=0`}
              title={lecture.titre}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Une seule ligne, à tout format : le titre de la séance, et de quoi
              l'arrêter. Le titre est rogné plutôt que replié — sur téléphone une
              deuxième ligne se prend sur la liste, et au cran « petite » le
              panneau ne fait que 352 px. Il reste en entier sur l'image.
              Quarante pixels en tout : ce bandeau est pris sur la vidéo et sur
              les définitions, et tout blanc de plus y est du blanc en moins.
              Noir comme l'image qu'il prolonge : en blanc il ouvrait sous le
              lecteur une seconde zone, alors qu'il en fait partie. */}
          <div className="flex items-center gap-2 bg-ink-900 px-3 py-1 lg:px-3.5 lg:py-1.5">
            <p className="titre min-w-0 flex-1 truncate text-[15px] leading-snug text-ink-100">
              {lecture.titre}
            </p>

            <div className="flex shrink-0 items-center gap-2">
              {taille && onTaille && (
                <div
                  role="group"
                  aria-label="Largeur du lecteur"
                  className="hidden items-center rounded-lg border border-white/30 lg:flex"
                >
                  {TAILLES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onTaille(t.id)}
                      aria-pressed={taille === t.id}
                      title={`Largeur ${t.libelle.toLowerCase()}`}
                      className={`min-h-9 px-2 text-xs font-medium transition first:rounded-l-lg last:rounded-r-lg ${
                        taille === t.id
                          ? 'bg-white text-ink-900'
                          : 'text-white/75 hover:bg-white/15'
                      }`}
                    >
                      {t.libelle}
                    </button>
                  ))}
                </div>
              )}

              {/* Cerné et légendé « Arrêter », le bouton pesait plus que le titre
                de la séance à côté duquel il se tient, alors qu'on l'actionne
                une fois pour dix qu'on lit ce titre. Nue, en revanche, la croix
                ne se donnait plus pour une commande. Reste un liseré : un cercle
                de 32 px, assez pour dire « on appuie ici », dans une zone
                touchable de 44 px qui, elle, ne se voit pas. Le mot demeure en
                infobulle et pour qui n'y voit pas. */}
              <button
                type="button"
                onClick={onFermer}
                aria-label="Arrêter la vidéo"
                title="Arrêter la vidéo"
                /* The touch target keeps its 44 px but imposes only 32 on the
                   strip: the six pixels trimmed top and bottom bite into the
                   picture, where they cost nothing. */
                className="group -my-1.5 flex min-h-11 min-w-11 shrink-0 items-center justify-center transition active:scale-95"
              >
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-[13px] text-white/75 transition group-hover:bg-white/15 group-hover:text-white group-active:bg-white/15"
                >
                  ✕
                </span>
              </button>
            </div>
          </div>

          {/* Une ligne : trois en prenaient soixante pixels au plan du corps,
              qui se retrouvait coupé en bas d'écran. */}
          <p className="hidden px-3.5 pb-3 text-xs leading-relaxed text-ink-400 lg:block">
            La lecture démarre un peu avant la mention.{' '}
            <kbd className="rounded border border-ink-300 px-1">Échap</kbd> l'arrête, si le
            curseur n'est pas dans le lecteur.
          </p>
        </div>
        {dessous}
      </div>

      {/* Le lecteur ancré masquerait les dernières entrées de la liste : on
          rend la hauteur qu'il occupe, sur téléphone seulement. La vidéo fait
          toute la largeur en 16/9, soit 56,25 vw ; la barre du dessous, 2,5 rem.
          Calculé et non deviné : une hauteur fixe laissait une entrée sous le
          lecteur, ou un trou après lui. */}
      <div
        aria-hidden="true"
        className="lg:hidden"
        style={{ height: 'calc(56.25vw + 2.5rem)' }}
      />
    </aside>
  );
}
