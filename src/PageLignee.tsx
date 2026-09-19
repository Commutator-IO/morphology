import { useEffect, useRef, useState } from 'react';
import { Entete, Pied } from './components/Cadre';
import { Lecteur, type Lecture } from './components/Lecteur';
import { useAncre } from './lib/ancre';
import { ecrireTaille, grilleDe, lireTaille, type TailleLecteur } from './lib/lecteur';
import {
  CLASSIQUES,
  DATEES,
  ECHELLE,
  ECHELLE_LONGUE,
  FIGURES,
  finDe,
  parSection,
  SECTIONS,
  type Classique,
  type Figure,
} from './lib/lignee';

/**
 * La lignée, sous forme de frise.
 *
 * Reprise du motif de l'onglet Timeline de germain-project : une règle collée
 * sous l'en-tête, une barre par vie sur la même échelle, et la barre de la
 * fiche qu'on lit qui s'allume à mesure qu'on descend la colonne.
 *
 * Ici la frise n'est pas un ornement : elle montre d'un coup d'œil ce qu'une
 * liste ne dit pas — que Richer meurt cinq ans avant la naissance de Debord, de
 * sorte que la transmission passe par les livres et non par la parole, et que
 * ses élèves naissent tous pendant qu'il enseigne déjà.
 */

/**
 * La plaque de portrait.
 *
 * Liée depuis Wikimedia Commons, jamais réhébergée, et seulement quand le
 * fichier est dans le domaine public ou sous licence libre. Pour les vivants il
 * n'en existe pas : la plaque montre alors leurs initiales plutôt qu'un visage
 * que personne n'a le droit de reproduire.
 */
function Plaque({ figure }: { figure: Figure }) {
  const initiales = figure.nom
    .split(/[\s-]+/)
    .filter((m) => /^[A-ZÉÀÇ]/.test(m) && !['Le', 'De', 'La'].includes(m))
    .map((m) => m[0])
    .slice(0, 2)
    .join('');
  return (
    <div className="relative aspect-[3/4] w-20 shrink-0 self-start overflow-hidden rounded-md border border-ink-200 bg-ink-100 sm:w-24">
      {figure.portrait ? (
        <img
          src={figure.portrait}
          alt={`Portrait de ${figure.nom}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          style={{ objectPosition: '50% 20%' }}
        />
      ) : (
        <div
          aria-hidden="true"
          className="titre flex h-full w-full items-center justify-center text-[22px] text-ink-400"
        >
          {initiales}
        </div>
      )}
    </div>
  );
}

/**
 * La frise embarquée dans une fiche.
 *
 * Deux lectures du même contenu : un axe avec un point par étape, qui donne
 * d'un coup d'œil la forme d'une carrière — ici trente-quatre ans d'un côté et
 * vingt-deux de l'autre — puis la liste datée, qui seule se lit vraiment. L'axe
 * sans la liste serait décoratif ; la liste sans l'axe perdrait les intervalles.
 */
function FriseCarriere({ jalons }: { jalons: NonNullable<Figure['jalons']> }) {
  const debut = jalons[0].annee;
  const fin = jalons[jalons.length - 1].annee;
  const place = (a: number) => ((a - debut) / (fin - debut)) * 100;

  return (
    <div className="mt-3 rounded-lg border border-ink-100 bg-ink-50/60 px-3 pt-3 pb-2.5">
      <div className="relative h-4">
        <span aria-hidden="true" className="absolute top-[7px] right-0 left-0 h-px bg-ink-300" />
        {jalons.map((j) => (
          <span
            key={j.annee}
            title={`${j.annee} — ${j.fait}`}
            className="absolute top-[4px] h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-brand-500"
            style={{ left: `${place(j.annee)}%` }}
          />
        ))}
      </div>
      <ol className="mt-1.5 space-y-1">
        {jalons.map((j) => (
          <li key={j.annee} className="flex gap-2.5 text-[13px] leading-snug">
            <span className="tabular w-9 shrink-0 font-semibold text-brand-700">{j.annee}</span>
            <span className="text-ink-700">{j.fait}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Une figure dont l'année de naissance est établie. */
function barre(f: Figure) {
  return { gauche: ECHELLE.place(f.ne!), largeur: ECHELLE.place(finDe(f)) - ECHELLE.place(f.ne!) };
}

/**
 * La règle, collée sous l'en-tête.
 *
 * La vie qu'on lit y est tracée en sanguine, son année de naissance imprimée
 * au-dessus : descendre la page promène la barre sur près de deux siècles.
 */
function Regle({ actif }: { actif: Figure }) {
  const { gauche, largeur } = barre(actif);
  return (
    <div className="sticky top-[5.75rem] z-20 -mx-4 border-b border-ink-200/70 bg-ink-50/95 px-4 py-2.5 backdrop-blur">
      <div className="relative h-10">
        <div className="absolute top-5 right-0 left-0 h-px bg-ink-300" />
        {ECHELLE.reperes.map((a) => (
          <span
            key={a}
            className={`tabular absolute top-6 -translate-x-1/2 text-[10px] ${
              a % 50 === 0 ? 'font-semibold text-ink-600' : 'text-ink-400'
            }`}
            style={{ left: `${ECHELLE.place(a)}%` }}
          >
            {a}
          </span>
        ))}
        <span
          aria-hidden="true"
          className="absolute top-[17px] h-[7px] rounded-full bg-brand-200 transition-all duration-300"
          style={{ left: `${gauche}%`, width: `${largeur}%` }}
        />
        {DATEES.map((f) => {
          const allume = f.id === actif.id;
          return (
            <span
              key={f.id}
              title={`${f.nom}, ${f.ne}`}
              className="absolute -translate-x-1/2 rounded-full transition-all duration-300"
              style={{
                left: `${ECHELLE.place(f.ne!)}%`,
                top: allume ? 16 : 18,
                width: allume ? 9 : 5,
                height: allume ? 9 : 5,
                background: allume ? 'var(--color-brand-600)' : 'var(--color-ink-400)',
              }}
            />
          );
        })}
        <span
          aria-hidden="true"
          className="tabular absolute top-0 -translate-x-1/2 text-[11px] font-semibold whitespace-nowrap text-brand-700 transition-all duration-300"
          style={{ left: `${gauche}%` }}
        >
          {actif.ne}
        </span>
      </div>
    </div>
  );
}

/**
 * Toutes les vies d'un coup.
 *
 * Une barre par personne sur l'échelle de la règle, celle qu'on lit en
 * sanguine, celle de Debord en ocre pour qu'on retrouve le centre. Cliquer une
 * barre mène à sa fiche.
 */
function Frise({ actif, onChoisir }: { actif: Figure; onChoisir: (f: Figure) => void }) {
  return (
    <figure className="card mt-6 px-4 py-4">
      <figcaption className="text-[11px] font-bold tracking-[0.1em] text-ink-500 uppercase">
        {DATEES.length} vies, {ECHELLE.debut}–{ECHELLE.fin}
      </figcaption>
      <div className="relative mt-3">
        {ECHELLE.reperes.map((a) => (
          <span
            key={a}
            aria-hidden="true"
            className={`absolute top-0 bottom-5 w-px ${a % 50 === 0 ? 'bg-ink-200' : 'bg-ink-100'}`}
            style={{ left: `${ECHELLE.place(a)}%` }}
          />
        ))}
        <ul className="relative space-y-[3px] pb-5">
          {DATEES.map((f) => {
            const allume = f.id === actif.id;
            const centre = f.role === 'lui';
            const { gauche, largeur } = barre(f);
            return (
              <li key={f.id} className="relative h-[17px]">
                <button
                  type="button"
                  onClick={() => onChoisir(f)}
                  title={`${f.nom} (${f.dates})`}
                  className={`absolute inset-y-0 flex items-center overflow-visible rounded-sm transition-colors ${
                    allume
                      ? 'bg-brand-600'
                      : centre
                        ? 'bg-os-300 hover:bg-os-500'
                        : 'bg-ink-200 hover:bg-brand-200'
                  }`}
                  style={{ left: `${gauche}%`, width: `${largeur}%` }}
                >
                  <span
                    className={`pl-1.5 text-[10.5px] leading-none font-medium whitespace-nowrap ${
                      allume ? 'text-white' : 'text-ink-700'
                    }`}
                  >
                    {f.nom}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {ECHELLE.reperes
          .filter((a) => a % 50 === 0)
          .map((a) => (
            <span
              key={a}
              className="tabular absolute bottom-0 -translate-x-1/2 text-[10px] text-ink-400"
              style={{ left: `${ECHELLE.place(a)}%` }}
            >
              {a}
            </span>
          ))}
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-ink-500">
        Richer meurt cinq ans avant la naissance de Debord : entre eux la
        transmission passe par les livres, non par la parole. Les élèves, eux,
        naissent tous pendant qu'il enseigne déjà.
      </p>
    </figure>
  );
}

/**
 * Le temps long, en arrière-plan.
 *
 * Les artistes que Debord cite en cours s'étendent de Giotto à Bacon : les
 * placer sur la frise principale écraserait la lignée moderne, qui tient en
 * deux générations et qui est le sujet de la page. Ils ont donc leur propre
 * bande, plus fine et en gris, avec la fenêtre de la frise principale marquée
 * dessus — on voit alors sur quelle épaisseur d'histoire s'appuie
 * l'enseignement, sans que l'histoire prenne le pas sur lui.
 *
 * Les vies sont rangées par lignes en remplissant la première qui est libre,
 * faute de quoi quarante-six lignes d'une barre chacune feraient un mur.
 */
function BandeHistorique() {
  const [survole, setSurvole] = useState<Classique | null>(null);

  const lignes: Classique[][] = [];
  for (const c of CLASSIQUES) {
    // Une marge de dix ans évite que deux barres se touchent bout à bout et
    // paraissent n'en faire qu'une.
    const libre = lignes.find((l) => l[l.length - 1].mort + 10 < c.ne);
    if (libre) libre.push(c);
    else lignes.push([c]);
  }
  const { place } = ECHELLE_LONGUE;

  return (
    <figure className="mt-5 rounded-[var(--radius-card)] border border-ink-200/70 bg-white px-4 py-3.5">
      <figcaption className="text-[11px] font-bold tracking-[0.1em] text-ink-400 uppercase">
        En arrière-plan : les {CLASSIQUES.length} figures datées que Debord cite
      </figcaption>

      {/* La bulle occupe une ligne réservée au-dessus de la bande, plutôt que de
          flotter par-dessus les barres : elle ne masque jamais ce qu'on survole,
          et la bande ne saute pas de hauteur quand elle apparaît. */}
      <p className="mt-2 h-4 text-[12px] leading-4">
        {survole ? (
          <span className="text-ink-800">
            <span className="font-semibold">{survole.nom}</span>{' '}
            <span className="tabular text-ink-400">
              {survole.ne}-{survole.mort}
            </span>
            {survole.type === 'anatomiste' && (
              <span className="ml-1.5 text-os-700">· anatomiste</span>
            )}
          </span>
        ) : (
          <span className="text-ink-400">Survolez une barre pour lire le nom.</span>
        )}
      </p>

      <div className="relative mt-1">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 rounded-sm bg-brand-50"
          style={{
            left: `${place(ECHELLE.debut)}%`,
            width: `${place(ECHELLE.fin) - place(ECHELLE.debut)}%`,
          }}
        />
        {ECHELLE_LONGUE.reperes.map((a) => (
          <span
            key={a}
            aria-hidden="true"
            className="absolute top-0 bottom-4 w-px bg-ink-100"
            style={{ left: `${place(a)}%` }}
          />
        ))}
        <ul className="relative space-y-[3px] pb-4" onMouseLeave={() => setSurvole(null)}>
          {lignes.map((ligne, i) => (
            <li key={i} className="relative h-[9px]">
              {ligne.map((c) => {
                const actif = survole?.id === c.id;
                return (
                  <a
                    key={c.id}
                    href={`/references/#${c.id}`}
                    onMouseEnter={() => setSurvole(c)}
                    onFocus={() => setSurvole(c)}
                    onBlur={() => setSurvole(null)}
                    aria-label={`${c.nom}, ${c.ne}-${c.mort}`}
                    /* Les anatomistes en couleur d'os, le reste en gris. Ils ne
                       sont que sept sur cinquante-huit, et ce sont eux qui font
                       le socle de la discipline enseignée : noyés dans la même
                       teinte que les peintres, on ne les voyait pas. */
                    className={`absolute inset-y-0 rounded-[2px] transition-colors ${
                      actif
                        ? 'bg-brand-600'
                        : c.type === 'anatomiste'
                          ? 'bg-os-500'
                          : 'bg-ink-300'
                    }`}
                    style={{
                      left: `${place(c.ne)}%`,
                      // Un plancher de 1,6 % : en deçà, les vies courtes du
                      // XIVe siècle faisaient des barres de quatre pixels,
                      // impossibles à viser à la souris.
                      width: `${Math.max(place(c.mort) - place(c.ne), 1.6)}%`,
                    }}
                  />
                );
              })}
            </li>
          ))}
        </ul>
        {ECHELLE_LONGUE.reperes.map((a) => (
          <span
            key={a}
            className="tabular absolute bottom-0 -translate-x-1/2 text-[9px] text-ink-400"
            style={{ left: `${place(a)}%` }}
          >
            {a}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-ink-500">
        Sept siècles de peintres, de sculpteurs et d'
        <span className="font-medium text-os-700">anatomistes</span> — ces
        derniers en couleur d'os — contre deux générations d'enseignement, la
        zone claire. Ils sont ici et non dans la frise du haut parce qu'ils sont
        les sources du cours et non la lignée : Vésale ou Bourgery n'ont rien
        transmis à Debord qu'un livre. Les deux qui figurent aussi plus haut,
        Duval et Richer, y sont à un autre titre — ils ont occupé sa chaire.
        Cliquez une barre pour les passages où il en parle.
      </p>
    </figure>
  );
}

export function PageLignee() {
  const [actif, setActif] = useState<Figure>(DATEES[0]);
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [taille, setTaille] = useState<TailleLecteur>(lireTaille);
  const fiches = useRef<(HTMLElement | null)[]>([]);
  useAncre();

  function reglerTaille(t: TailleLecteur) {
    setTaille(t);
    ecrireTaille(t);
  }

  /**
   * Ouvre une vidéo dans le panneau plutôt que dans un onglet.
   *
   * Le lien reste un lien : un clic modifié ou du milieu part sur YouTube,
   * comme n'importe où ailleurs sur le site.
   */
  function jouer(e: React.MouseEvent, videoId: string, instant: number, titre: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    setLecture({ videoId, instant, titre });
  }

  /**
   * La fiche la plus proche du tiers supérieur de l'écran est celle qu'on lit.
   * `rootMargin` resserre la bande observée à ce bandeau, pour que la règle
   * bouge quand une fiche arrive plutôt que quand la précédente s'en va.
   */
  useEffect(() => {
    const noeuds = fiches.current.filter((n): n is HTMLElement => n !== null);
    if (!noeuds.length || typeof IntersectionObserver === 'undefined') return;
    const observateur = new IntersectionObserver(
      (entrees) => {
        const vue = entrees.find((e) => e.isIntersecting);
        const id = vue?.target.getAttribute('data-figure');
        const f = DATEES.find((x) => x.id === id);
        if (f) setActif(f);
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: 0 },
    );
    noeuds.forEach((n) => observateur.observe(n));
    return () => observateur.disconnect();
  }, []);

  const numerises = FIGURES.flatMap((f) => f.ouvrages).filter((o) => o.url).length;
  let rang = 0;

  return (
    <>
      <Entete chemin="/lignee/" />

      <main className="mx-auto max-w-4xl px-4 pb-16 lg:max-w-6xl">
        <h1 className="titre mt-4 text-xl leading-tight text-ink-900 sm:mt-6 sm:text-3xl">
          Lignée
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
          Un cours ne sort pas de rien. Celui-ci prolonge une chaire tenue depuis
          le XIX<sup>e</sup> siècle, et il a formé des élèves qui écrivent et
          dessinent à leur tour. {numerises} des ouvrages cités sont librement
          consultables en ligne.
        </p>

        <Frise
          actif={actif}
          onChoisir={(f) =>
            document.getElementById(f.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        />

        <BandeHistorique />

        <div className={`mt-6 lg:grid lg:gap-8 ${grilleDe(taille)}`}>
          <div>
            <Regle actif={actif} />

            <div className="mt-8 space-y-10">
          {SECTIONS.map((section) => {
            const figures = parSection(section.role);
            if (!figures.length) return null;
            return (
              <section key={section.role}>
                <h2 className="titre text-xl leading-tight text-ink-900">{section.titre}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-600">{section.propos}</p>

                <div className="mt-4 space-y-3">
                  {figures.map((f) => {
                    const i = rang++;
                    return (
                      <article
                        key={f.id}
                        id={f.id}
                        data-figure={f.id}
                        ref={(n) => {
                          fiches.current[i] = n;
                        }}
                        className="card scroll-mt-44 flex gap-3.5 px-4 py-3.5"
                      >
                        <Plaque figure={f} />

                        <div className="min-w-0 flex-1">
                        <h3 className="titre text-[17px] leading-tight text-ink-900">
                          {f.nom}
                          {f.dates && (
                            <span className="tabular ml-2 text-[13px] font-normal text-ink-400">
                              {f.dates}
                            </span>
                          )}
                        </h3>

                        <p className="mt-2 text-[15px] leading-relaxed text-ink-800">{f.notice}</p>

                        {f.liens?.map((l) => (
                          <p key={l.url} className="mt-2 text-[13px]">
                            <a
                              href={l.url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(ev) => {
                                const id = /[?&]v=([\w-]+)/.exec(l.url)?.[1];
                                if (id) jouer(ev, id, 0, `${f.nom} — ${l.libelle.replace(' ↗', '')}`);
                              }}
                              className="text-brand-700 underline underline-offset-2"
                            >
                              {l.libelle}
                            </a>
                            {l.propos && <span className="text-ink-400"> — {l.propos}</span>}
                          </p>
                        ))}

                        {f.jalons && <FriseCarriere jalons={f.jalons} />}

                        {f.instagram && (
                          <p className="mt-2 text-[13px]">
                            <a
                              href={`https://www.instagram.com/${f.instagram}/`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-700 underline underline-offset-2"
                            >
                              @{f.instagram} ↗
                            </a>
                            <span className="text-ink-400"> — son travail d'aujourd'hui</span>
                          </p>
                        )}

                        {f.ouvrages.length > 0 && (
                          <ul className="mt-3 space-y-2">
                            {f.ouvrages.map((o) => (
                              <li key={o.titre} className="text-[14px] leading-relaxed">
                                <i className="text-ink-900">{o.titre}</i>
                                {(o.editeur || o.annee) && (
                                  <span className="text-ink-500">
                                    {o.editeur ? `, ${o.editeur}` : ''}
                                    {o.annee ? `, ${o.annee}` : ''}
                                  </span>
                                )}
                                {o.url && (
                                  <>
                                    {' — '}
                                    <a
                                      href={o.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-brand-700 underline underline-offset-2"
                                    >
                                      {o.url.includes('archive.org')
                                        ? 'lire en ligne ↗'
                                        : 'chez l’éditeur ↗'}
                                    </a>
                                  </>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* La source est affichée et non reléguée : une
                            bibliographie sans provenance est une liste
                            d'affirmations. */}
                        {f.ecoutes && (
                          <div className="mt-3">
                            <p className="text-xs font-medium tracking-wide text-ink-500 uppercase">
                              Debord en parle
                            </p>
                            <ul className="mt-1.5 space-y-1">
                              {f.ecoutes.map((ec) => (
                                <li key={`${ec.seance}-${ec.t}`} className="text-[13px] leading-snug">
                                  <a
                                    href={`https://www.youtube.com/watch?v=${ec.video}&t=${ec.t}s`}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(ev) =>
                                      jouer(ev, ec.video, ec.t, `Séance ${ec.seance} — ${f.nom}`)
                                    }
                                    className="tabular whitespace-nowrap text-brand-700 underline underline-offset-2"
                                  >
                                    S{ec.seance} · {ec.horodate}
                                  </a>{' '}
                                  <span className="text-ink-600">{ec.propos}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <p className="mt-3 border-t border-ink-100 pt-2.5 text-xs leading-relaxed text-ink-400">
                          {f.source}
                        </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
            </div>
          </div>

          <Lecteur
            lecture={lecture}
            onFermer={() => setLecture(null)}
            taille={taille}
            onTaille={reglerTaille}
          />
        </div>
      </main>

      <Pied />
    </>
  );
}
