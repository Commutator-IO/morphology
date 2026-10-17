import { useEffect, useRef, useState } from 'react';
import { horodatage } from '../lib/conferences';

/** What the panel plays: a lecture, from a moment. */
export type LectureAudio = {
  id: string;
  titre: string;
  src: string;
  notice: string;
  instant: number;
};

/**
 * Audio player, fed straight from Bibnum.
 *
 * Nothing is copied: the browser asks Bibnum for the file, which serves it by
 * ranges, so jumping to a moment does not download what comes before it.
 *
 * Unlike the video, it stays in the page on a phone too. Bibnum offers no link
 * that opens a recording at a given moment, so leaving the site would lose the
 * very thing the index is for; and a sound bar costs the screen far less than
 * a picture.
 */
export function LecteurAudio({
  lecture,
  onFermer,
}: {
  lecture: LectureAudio | null;
  onFermer: () => void;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  // Set when the browser refuses to start the sound by itself.
  const [bloque, setBloque] = useState(false);

  useEffect(() => {
    const a = audio.current;
    if (!a || !lecture) return;
    const aller = () => {
      a.currentTime = lecture.instant;
      // A page opened from a link has had no click yet, and browsers then
      // refuse to start a sound. The player is already at the right moment: a
      // visible button says so, rather than leaving a silent bar.
      a.play().then(() => setBloque(false), () => setBloque(true));
    };
    if (a.readyState >= 1) aller();
    else a.addEventListener('loadedmetadata', aller, { once: true });
    return () => a.removeEventListener('loadedmetadata', aller);
  }, [lecture]);

  useEffect(() => {
    if (!lecture) return;
    const auClavier = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFermer();
    };
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [lecture, onFermer]);

  if (!lecture) {
    return (
      <aside className="hidden lg:block">
        <div className="sticky top-[6.5rem] rounded-[var(--radius-card)] border border-dashed border-ink-300 px-4 py-6 text-sm leading-relaxed text-ink-500">
          <p className="titre text-[15px] text-ink-700">Le lecteur s'ouvrira ici</p>
          <p className="mt-1.5">
            Choisissez une conférence : le son est lu depuis le catalogue de PSL, sans
            quitter cette page.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white shadow-[0_-8px_24px_-12px_rgb(27_24_19/0.25)] lg:sticky lg:inset-x-auto lg:bottom-auto lg:top-[6.5rem] lg:z-auto lg:border lg:border-ink-200/70 lg:shadow-none lg:rounded-[var(--radius-card)] lg:overflow-hidden">
        <div className="flex items-center gap-2 bg-ink-900 px-3 py-1 lg:px-3.5 lg:py-1.5">
          <p className="titre min-w-0 flex-1 truncate text-[15px] leading-snug text-ink-100">
            {lecture.titre}
          </p>
          <a
            href={lecture.notice}
            target="_blank"
            rel="noreferrer"
            className="-my-1.5 flex min-h-11 shrink-0 items-center text-xs text-white/75 underline underline-offset-2"
          >
            notice ↗
          </a>
          <button
            type="button"
            onClick={onFermer}
            aria-label="Arrêter l'enregistrement"
            title="Arrêter l'enregistrement"
            className="group -my-1.5 flex min-h-11 min-w-11 shrink-0 items-center justify-center transition active:scale-95"
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-[13px] text-white/75 transition group-hover:bg-white/15 group-hover:text-white"
            >
              ✕
            </span>
          </button>
        </div>
        {bloque && (
          <button
            type="button"
            onClick={() => {
              void audio.current?.play();
              setBloque(false);
            }}
            className="flex min-h-11 w-full items-center justify-center gap-2 bg-brand-600 px-3 text-[15px] font-medium text-white"
          >
            <span aria-hidden="true">▶</span> Lire à {horodatage(lecture.instant)}
          </button>
        )}
        <audio
          ref={audio}
          key={lecture.src}
          controls
          preload="metadata"
          src={lecture.src}
          className="block h-14 w-full"
        />
        <p className="hidden px-3.5 py-2.5 text-xs leading-relaxed text-ink-400 lg:block">
          Enregistrement de l'École des Beaux-Arts, numérisé par l'Université PSL, lu depuis
          son catalogue.
        </p>
      </div>

      {/* The fixed bar would hide the last entries of the list: give back the
          height it takes, on a phone only. */}
      <div aria-hidden="true" className="h-[7.5rem] lg:hidden" />
    </aside>
  );
}
