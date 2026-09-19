import { useEffect } from 'react';
import { lienYoutube } from '../lib/lexique';
import { TAILLES, type TailleLecteur } from '../lib/lecteur';

/** Ce que le panneau joue : une séance, à un instant. */
export type Lecture = { videoId: string; instant: number; titre: string };

/**
 * Lecteur embarqué.
 *
 * Sur grand écran, il tient dans un panneau collant à droite de la liste : on
 * consulte l'index et la séance en même temps, et l'on suit un muscle de séance
 * en séance sans perdre sa place. Sur téléphone, il s'ancre en bas de l'écran,
 * au-dessus de la liste qui continue de défiler — même principe, moins de place.
 *
 * Jouer dans la page plutôt que de partir sur YouTube a une raison précise : une
 * fois sur YouTube, on ne peut plus rien proposer, ni arrêter la lecture, ni
 * revenir à l'index. Le lien vers YouTube reste offert pour qui préfère
 * l'application.
 */
export function Lecteur({
  lecture,
  onFermer,
  taille,
  onTaille,
}: {
  lecture: Lecture | null;
  onFermer: () => void;
  /** Largeur du panneau face au texte ; absente, aucun réglage n'est proposé. */
  taille?: TailleLecteur;
  onTaille?: (t: TailleLecteur) => void;
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
    // Rien à jouer : sur grand écran on annonce la place que prendra le lecteur,
    // sur téléphone on n'affiche rien plutôt qu'une bande vide en bas d'écran.
    return (
      <aside className="hidden lg:block">
        <div className="sticky top-[6.5rem]">
          <div className="rounded-[var(--radius-card)] border border-dashed border-ink-300 px-4 py-6 text-sm leading-relaxed text-ink-500">
            <p className="titre text-[15px] text-ink-700">Le lecteur s'ouvrira ici</p>
            <p className="mt-1.5">
              Cliquez un horodatage : la séance se place à cet endroit sans quitter
              l'index, et vous gardez votre liste sous les yeux.
            </p>
          </div>
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

          <div className="flex items-start gap-3 px-3.5 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="titre truncate text-[15px] leading-snug text-ink-900 lg:whitespace-normal">
                {lecture.titre}
              </p>
              <p className="mt-1 text-xs text-ink-500">
                <a
                  href={lienYoutube(lecture.videoId, lecture.instant)}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  Ouvrir sur YouTube ↗
                </a>
              </p>
            </div>

            {/* Bouton d'arrêt plutôt que simple croix : c'est le geste qu'on
                cherche en cours, souvent dans l'urgence, et il doit se toucher
                sans viser. 44 px de haut comme toutes les cibles du site. */}
            <div className="flex shrink-0 items-center gap-2">
              {/* Réglage de largeur : sur grand écran seulement, puisque c'est
                  le partage avec la colonne de texte qu'il déplace. */}
              {taille && onTaille && (
                <div
                  role="group"
                  aria-label="Largeur du lecteur"
                  className="hidden items-center rounded-lg border border-ink-300 lg:flex"
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
                          ? 'bg-ink-800 text-white'
                          : 'text-ink-600 hover:bg-ink-100'
                      }`}
                    >
                      {t.libelle}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={onFermer}
                aria-label="Arrêter la vidéo"
                className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-ink-300 px-3 text-sm font-medium text-ink-700 transition active:scale-95 active:bg-ink-100"
              >
                <span aria-hidden="true">✕</span> Arrêter
              </button>
            </div>
          </div>

          <p className="hidden px-3.5 pb-3 text-xs leading-relaxed text-ink-400 lg:block">
            Le lecteur démarre quelques secondes avant la mention — Debord annonce
            souvent une forme avant d'y venir. <kbd className="rounded border border-ink-300 px-1">Échap</kbd>{' '}
            arrête la lecture, sauf si le curseur est entré dans le lecteur : rendez-lui
            d'abord le focus en cliquant la page.
          </p>
        </div>
      </div>

      {/* Le lecteur ancré masquerait les dernières entrées de la liste : on
          rend la hauteur qu'il occupe, sur téléphone seulement. */}
      <div aria-hidden="true" className="h-64 lg:hidden" />
    </aside>
  );
}
