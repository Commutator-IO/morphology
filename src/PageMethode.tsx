import { Entete, Pied } from './components/Cadre';
import { FENETRE_S, INDEX_GENERE, LEXIQUE, SEANCES, totalDe } from './lib/lexique';
import { REFERENCES, totalDeReference } from './lib/references';

/**
 * Comment l'index est fabriqué, et ce qu'il vaut.
 *
 * Page indispensable et non annexe : l'index repose sur une transcription
 * automatique, donc faillible. Quelqu'un qui s'en sert en cours doit savoir dans
 * quel sens il peut se tromper — un horodatage qui tombe à côté est sans gravité
 * si on s'y attend, et trompeur si on croit l'index exhaustif.
 */
export function PageMethode() {
  const muets = LEXIQUE.filter((t) => totalDe(t.id) === 0);
  const passages = LEXIQUE.reduce((s, t) => s + totalDe(t.id), 0);
  const mentions = REFERENCES.reduce((s, r) => s + totalDeReference(r.id), 0);
  const avecMusee = REFERENCES.filter((r) => r.musee).length;

  return (
    <>
      <Entete chemin="/methode/" />

      <main className="mx-auto max-w-4xl px-4 pb-16">
        <h1 className="titre mt-6 text-2xl leading-tight text-ink-900 sm:text-3xl">
          Méthode
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
          Cet index est un outil de repérage, pas une transcription du cours. Voici
          exactement comment il est construit, et ce qu'il ne sait pas faire.
        </p>

        <Section titre="Ce que contient le site">
          <p>
            La liste des {SEANCES.length} séances avec un lien vers YouTube, un
            lexique de {LEXIQUE.length} termes et {REFERENCES.length} références
            artistiques — définitions et notices écrites pour ce site — et{' '}
            {(passages + mentions).toLocaleString('fr-FR')} horodatages.
          </p>
          <p>
            Les sous-titres des séances ne sont pas publiés ici et ne le seront pas.
            Ils servent à fabriquer l'index, puis restent sur la machine qui l'a
            fabriqué. Le cours appartient à ses auteurs : ce site y renvoie, il ne
            le redistribue pas, et n'en propose ni résumé ni reformulation.
          </p>
        </Section>

        <Section titre="L'indexation de PSL, et ce que celle-ci ajoute">
          <p>
            Ce site n'est pas le premier index de ce cours. L'Université PSL a
            catalogué l'enseignement dans sa bibliothèque numérique, sous le titre{' '}
            <a
              href="https://bibnum.explore.psl.eu/s/psl/ark:/18469/290s8"
              target="_blank"
              rel="noreferrer"
              className="text-brand-700 underline underline-offset-2"
            >
              La morphologie aux Beaux-Arts de Paris
            </a>{' '}
            : 45 documents décrits un à un, avec un identifiant pérenne, et une
            indexation par sujet — dessin et morphologie sur l'ensemble, puis le
            bassin, l'épaule, la cage thoracique, le bras, le crâne, la colonne
            vertébrale, et ainsi de suite.
          </p>
          <p>
            C'est le catalogue de référence, et il fait autorité là où ce site ne
            le peut pas : notices établies, identifiants stables, description
            bibliographique. Allez-y pour citer une séance ou la retrouver dans
            dix ans.
          </p>
          <p>
            Ce que celui-ci ajoute est d'un autre ordre : la granularité. PSL
            indexe la séance — celle-ci porte sur l'épaule. Ce site indexe la
            seconde — le mot « acromion » est prononcé à telle minute de telle
            séance. Les deux se complètent plutôt qu'ils ne se doublent, et
            l'index fin ne vaudrait rien sans le catalogue qui l'ancre.
          </p>
        </Section>

        <Section titre="Lire une séance depuis l'index">
          <p>
            Un horodatage lance la séance dans la page : à droite de la liste sur
            un écran large, ancrée en bas sur un téléphone. La lecture s'arrête
            avec le bouton <i>Arrêter</i> ou la touche <kbd>Échap</kbd> — à ceci
            près que si le curseur est entré dans le lecteur, c'est YouTube qui
            reçoit la touche : cliquez la page d'abord.
          </p>
          <p>
            Jouer dans la page plutôt que d'ouvrir YouTube a une raison : une fois
            parti, on ne peut plus rien proposer, ni arrêter, ni revenir à sa
            place dans l'index. Le lien vers YouTube reste offert sous le lecteur,
            et un clic avec Ctrl, Cmd ou la molette ouvre la séance dans un onglet
            comme n'importe quel lien.
          </p>
        </Section>

        <Chaine />

        <Section titre="Les homophones, et comment ils sont tranchés">
          <p>
            Deux confusions différentes se ressemblent dans les sous-titres, et
            elles ne se règlent pas de la même façon.
          </p>
          <p>
            <b className="font-semibold text-ink-900">La première est un défaut d'oreille de la machine.</b>{' '}
            La reconnaissance vocale n'a aucun modèle d'anatomie : elle écrit le mot
            courant qui sonne comme le mot savant. « Grand public » est le grand
            oblique, quatre-vingt-dix-neuf fois ; « numerus » l'humérus ;
            « pete rock » l'épitrochlée. Ces formes-là ne se devinent pas d'après le
            sujet de la séance mais d'après le son — « public » ressemble à
            « oblique », jamais à « dorsal ». Une fois entendues, elles entrent au
            lexique comme n'importe quelle autre graphie du terme.
          </p>
          <p>
            <b className="font-semibold text-ink-900">La seconde tient au cours lui-même.</b>{' '}
            Debord emploie réellement un même mot dans deux sens : « fléchisseur »
            pour l'avant-bras comme pour la jambe, « trapèze » pour le muscle du dos
            comme pour l'os du poignet, « oblique » pour le muscle du flanc comme
            pour une direction, « méta » pour le métacarpien comme pour le
            métatarsien. Là, c'est le passage qui décide, et le voisinage qu'on
            compte autour de la mention.
          </p>
          <p>
            Trois marques suffisent à tout dire, dans le lexique : un mot dont
            l'accent seul fait le sens est cherché accentué — le modèle et le
            modelé, la côte et le côté ; un mot partagé est mis en attente
            d'arbitrage ; une tournure qui prouve que le mot n'est pas la notion
            annule la mention pour tout le monde.
          </p>
          <p>
            <b className="font-semibold text-ink-900">Rien de tout cela n'a été décidé sur plan.</b>{' '}
            Chaque graphie a d'abord été comptée dans le corpus, puis écoutée dans
            la séance : un passage douteux est ouvert à son horodatage, et ce qu'on
            entend tranche. C'est ainsi qu'« un bout de trapèze » s'est révélé une
            figure qu'on dessine, que « master i dit » était une mastoïdite, et
            qu'un « modèle des États-Unis » était un motel.
          </p>
        </Section>

        <Section titre="Comment les horodatages sont trouvés">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Les sous-titres générés automatiquement par YouTube sont récupérés
              pour les {SEANCES.length} séances, en français, dans leur langue
              d'origine.
            </li>
            <li>
              Chaque terme du lexique porte une liste de formes à chercher : le mot,
              ses flexions, ses synonymes, et les graphies fautives que la
              transcription produit réellement.
            </li>
            <li>
              Les formes sont cherchées sur le texte continu d'une séance, et non
              sous-titre par sous-titre : une locution comme « crête iliaque » tombe
              presque toujours à cheval sur deux sous-titres.
            </li>
            <li>
              Deux mentions séparées de moins de {FENETRE_S} secondes ne donnent
              qu'un horodatage. Sans cette règle, un terme dont Debord parle dix
              minutes produirait quarante liens vers le même développement.
            </li>
            <li>
              Un mot que deux termes se partagent — « fléchisseur » se dit de
              l'avant-bras comme de la jambe — n'est attribué qu'au vu du
              voisinage : on compte, autour de la mention, les mots propres à
              chaque région, et le plus fourni l'emporte. À égalité, la mention
              n'est rangée nulle part : mieux vaut la perdre que la ranger à tort.
            </li>
            <li>
              Certaines tournures, relevées puis vérifiées à l'écoute, disent au
              contraire que le mot n'est pas la notion : « un bout de trapèze »
              est une figure qu'on dessine, « une ligne oblique » une direction
              et non le muscle du flanc. Elles annulent la mention pour tout le
              monde.
            </li>
            <li>
              L'horodatage recule de quelques secondes sur la mention, pour qu'on
              arrive avant le mot plutôt qu'après.
            </li>
          </ol>
          <p className="tabular text-[13px] text-ink-500">
            Index recalculé le {INDEX_GENERE}.
          </p>
        </Section>

        <Section titre="Les limites, dans l'ordre où elles gênent">
          <p>
            <b className="font-semibold text-ink-900">La transcription se trompe.</b>{' '}
            Elle est produite par une reconnaissance vocale sans modèle du
            vocabulaire anatomique. Elle écrit « acromio » pour acromion,
            « thénard » pour thénar, « épicondylite » pour épicondyle, « solaire »
            pour soléaire. Ces graphies-là sont dans le lexique parce qu'on les a
            relevées ; d'autres passent inévitablement au travers.
          </p>
          <p>
            <b className="font-semibold text-ink-900">L'index n'est pas exhaustif.</b>{' '}
            Un terme prononcé mais mal transcrit est absent. Une absence ne prouve
            donc rien : elle dit que le mot n'a pas été trouvé, pas qu'il n'a pas
            été dit.
          </p>
          <p>
            <b className="font-semibold text-ink-900">
              Un horodatage peut tomber à côté.
            </b>{' '}
            Le lien mène au moment où le mot est prononcé, ce qui n'est pas toujours
            le moment où la chose est expliquée — Debord annonce souvent un muscle
            longtemps avant d'y venir.
          </p>
          <p>
            <b className="font-semibold text-ink-900">
              Le découpage en parties est un choix.
            </b>{' '}
            La playlist mêle les sujets ; le regroupement proposé suit la logique du
            cours, mais il est de notre fait et non de celui de Debord.
          </p>
        </Section>

        <Section titre="Les références artistiques, vérifiées une par une">
          <p>
            Le même relevé automatique appliqué à des noms propres donne des
            résultats inutilisables tant qu'on ne les a pas lus. Le français est
            plein de mots qui sont aussi des patronymes : <i>léger</i> revient
            trente-neuf fois, mais comme adjectif ; <i>carrière</i> désigne un
            parcours et non le peintre ; <i>boucher</i> est un métier ou un verbe ;{' '}
            <i>durer</i> est un verbe, et non Dürer, que la transcription n'écrit
            jamais avec son tréma.
          </p>
          <p>
            Chaque candidat a donc été ouvert et lu dans son passage avant d'être
            gardé ou écarté. Les {REFERENCES.length} références de la liste sont
            celles qui ont passé ce contrôle — elles ont toutes au moins une
            mention, et un test échoue si l'une d'elles n'en a plus. C'est une
            liste sûre mais close : un nom cité une seule fois et mal transcrit
            n'y figure pas.
          </p>
        </Section>

        <Section titre="Les liens vers les musées">
          <p>
            {avecMusee} des {REFERENCES.length} références portent un lien vers une
            page de musée. Aucune de ces adresses n'a été écrite de mémoire : elles
            viennent des API ouvertes de l'Art Institute of Chicago et du
            Metropolitan Museum, qui rendent l'adresse officielle de l'objet, son
            auteur et son statut de domaine public. La précaution n'est pas
            théorique — une adresse du Louvre qui semblait être celle de la Vénus
            de Milo désignait en réalité un cippe.
          </p>
          <p>
            <b className="font-semibold text-ink-900">
              Ce n'est pas l'œuvre projetée en cours.
            </b>{' '}
            Les sous-titres ne donnent pas les titres des diapositives. Le lien mène
            à une œuvre de la personne citée, dans une collection dont l'image est
            en accès libre : de quoi mettre un visage sur un nom, sans rien affirmer
            de faux. Quand la collection en proposait une, l'œuvre retenue montre un
            corps plutôt qu'un paysage.
          </p>
          <p>
            L'appariement par patronyme seul donne des faux : « Follower of Leonardo
            da Vinci » n'est pas Léonard, « Cecco del Caravaggio » et « Polidoro da
            Caravaggio » ne sont pas le Caravage, « Antoine Masson », graveur du
            XVII<sup>e</sup>, n'est pas André Masson. Les mentions d'atelier et
            d'attribution sont donc rejetées, et les patronymes partagés exigent le
            prénom. Un test refuse qu'une œuvre d'atelier soit attribuée au maître.
          </p>
          <p>
            <b className="font-semibold text-ink-900">
              Le pire des faux amis est le nom propre qui est aussi du vocabulaire
              d'anatomie.
            </b>{' '}
            Quatre références ont été retirées pour cette raison : « carpeaux » est
            la transcription de <i>carpo-</i>, dans l'articulation
            carpo-métacarpienne ; « courbet » celle du verbe <i>courber</i>, que
            Debord emploie à chaque séance ; « poussin » celle d'un fléchisseur du{' '}
            <i>pouce</i>. Ces noms-là remontent précisément là où le cours traite
            leur sujet, ce qui les rend d'autant plus convaincants — et d'autant
            plus faux. C'est un lecteur qui a signalé le premier ; les trois autres
            ont suivi à la vérification.
          </p>
          <p>
            Les {REFERENCES.length - avecMusee} références sans lien le sont pour
            trois raisons, toutes assumées : l'œuvre est encore sous droits, et
            aucune image n'en est librement diffusée — c'est le cas de Picasso, de
            Giacometti, de Bacon, de Miró, de Masson et de Balthus ; ou la personne
            n'est pas représentée dans ces deux collections ; ou il s'agit d'une
            œuvre précise tenue par un musée dont la recherche est fermée aux
            robots, et deviner son adresse reviendrait à l'inventer.
          </p>
        </Section>

        <Section titre="La nomenclature">
          <p>
            Debord enseigne dans la nomenclature française classique, celle des
            planches de l'École : cubitus et non ulna, omoplate et non scapula,
            rotule et non patella, couturier et non sartorius, jumeaux et non
            gastrocnémiens. Le lexique garde son mot comme entrée principale et
            donne la forme internationale à côté, parce que c'est celle des atlas
            qu'on trouvera ailleurs. La recherche accepte les deux.
          </p>
        </Section>

        {muets.length > 0 && (
          <Section titre={`Les ${muets.length} termes sans aucun passage`}>
            <p>
              Ils figurent au lexique parce qu'ils appartiennent au vocabulaire de
              leur région, mais la transcription ne les restitue jamais — soit
              Debord emploie un autre mot, soit la reconnaissance vocale les
              écorche au point d'être introuvables.
            </p>
            <ul className="flex flex-wrap gap-x-2 gap-y-1">
              {muets.map((t) => (
                <li key={t.id}>
                  <a
                    href={`/#${t.id}`}
                    className="text-brand-700 underline underline-offset-2"
                  >
                    {t.terme}
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section titre="Refaire l'index">
          <p>
            Le lexique est écrit à la main, l'index est calculé. Après avoir
            récupéré les sous-titres dans <code className="rounded bg-ink-100 px-1">transcripts/</code>{' '}
            — dossier non versionné —{' '}
            <code className="rounded bg-ink-100 px-1">npm run indexer</code> reconstruit
            les deux index, celui du vocabulaire et celui des références, et les
            tests vérifient que les comptes publiés correspondent bien à ce que
            l'indexeur a trouvé.
          </p>
        </Section>
      </main>

      <Pied />
    </>
  );
}

/**
 * La chaîne, dessinée.
 *
 * La page dit déjà tout cela en prose, mais l'ordre est ce qu'un lecteur doit
 * retenir : d'où vient chaque fichier, à quel moment le cours cesse d'être
 * reproduit, et où une oreille humaine intervient. Le schéma descend au lieu
 * d'aller de gauche à droite — sur un téléphone, une chaîne horizontale se lit
 * en faisant glisser, c'est-à-dire mal.
 *
 * SVG en ligne, dans la palette du site, le texte étant du vrai texte : il se
 * sélectionne et se lit à voix haute. Aucune bibliothèque : une dépendance pour
 * tracer huit rectangles coûterait plus cher qu'elle ne rapporte.
 */
function Chaine() {
  const boite = { fill: 'white', stroke: 'var(--color-ink-200)', strokeWidth: 1.4, rx: 10 };
  const titre = { fontSize: 12.5, fontWeight: 600, fill: 'var(--color-ink-900)', textAnchor: 'middle' as const };
  const detail = { fontSize: 9.5, fill: 'var(--color-ink-500)', textAnchor: 'middle' as const };
  const mono = { fontFamily: 'ui-monospace, Menlo, monospace' };

  return (
    <Section titre="La chaîne, d'un bout à l'autre">
      <p>
        Rien de ce qui descend cette chaîne n'est du texte du cours : à partir du
        lexique, on ne manipule plus que des identifiants et des secondes. La
        dernière étape est la seule qu'aucun fichier ne peut garantir.
      </p>

      <div className="card mx-auto max-w-[34rem] px-3 py-4">
        <svg
          viewBox="0 0 340 664"
          className="w-full"
          role="img"
          aria-label="La chaîne : les 45 séances filmées donnent, par yt-dlp, des sous-titres automatiques jamais publiés ; la reconnaissance vocale n'ayant aucun modèle d'anatomie, elle écrit « pete rock » pour épitrochlée et « grand public » pour grand oblique ; le lexique porte ces graphies fautives comme variantes, avec trois préfixes — accent strict, mot ambigu tranché par le voisinage, veto ; l'indexation produit un fichier d'identifiants et de secondes, d'où le site ; une relecture à l'oreille corrige le lexique et fait tout recommencer."
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <defs>
            <marker id="fleche" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9" fill="none" stroke="var(--color-ink-400)" strokeWidth="1.6" />
            </marker>
            <marker id="flecheClaire" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9" fill="none" stroke="var(--color-craie-600)" strokeWidth="1.6" />
            </marker>
          </defs>

          {/* 1 — la source */}
          <rect x="30" y="6" width="296" height="44" {...boite} />
          <text x="178" y="25" {...titre}>45 séances filmées</text>
          <text x="178" y="40" {...detail}>YouTube · Bibnum, Université PSL · 77 heures</text>

          <line x1="178" y1="54" x2="178" y2="76" stroke="var(--color-ink-400)" strokeWidth="1.3"
            markerEnd="url(#fleche)" />
          <text x="186" y="69" fontSize="9" fill="var(--color-ink-400)" style={mono}>yt-dlp --write-auto-subs</text>

          {/* 2 — les sous-titres, qui ne sortent pas d'ici */}
          <rect x="30" y="80" width="296" height="50" {...boite} />
          <text x="178" y="99" {...titre} style={mono}>transcripts/*.json3</text>
          <text x="178" y="114" {...detail}>59 Mo · non versionnés · jamais publiés</text>
          <text x="178" y="125" {...detail}>c'est ici que s'arrête le texte du cours</text>

          <line x1="178" y1="134" x2="178" y2="152" stroke="var(--color-ink-400)" strokeWidth="1.3"
            markerEnd="url(#fleche)" />

          {/* 3 — le défaut de la matière première */}
          <rect x="30" y="156" width="296" height="74" rx="10" fill="var(--color-brand-50)"
            stroke="var(--color-brand-200)" strokeWidth="1.4" />
          <text x="178" y="175" fontSize="12" fontWeight="600" fill="var(--color-brand-700)" textAnchor="middle">
            La transcription ne connaît pas l'anatomie
          </text>
          <text x="178" y="191" fontSize="9.5" fill="var(--color-brand-700)" textAnchor="middle">
            « pete rock » pour épitrochlée · « grand public » pour
          </text>
          <text x="178" y="203" fontSize="9.5" fill="var(--color-brand-700)" textAnchor="middle">
            grand oblique · « janvier » pour jambier · « numerus »
          </text>
          <text x="178" y="215" fontSize="9.5" fill="var(--color-brand-700)" textAnchor="middle">
            pour humérus · « solaire » pour soléaire
          </text>

          <line x1="178" y1="234" x2="178" y2="252" stroke="var(--color-ink-400)" strokeWidth="1.3"
            markerEnd="url(#fleche)" />

          {/* 4 — le lexique, où se rattrape le défaut */}
          <rect x="30" y="256" width="296" height="80" {...boite} />
          <text x="178" y="275" {...titre} style={mono}>lexique.json</text>
          <text x="178" y="290" {...detail}>chaque terme porte ses variantes — le mot, ses</text>
          <text x="178" y="302" {...detail}>flexions, et les graphies fautives relevées</text>
          <text x="178" y="321" fontSize="9" fill="var(--color-ink-500)" textAnchor="middle">
            <tspan style={mono} fill="var(--color-brand-600)">!</tspan> accent strict ·{' '}
            <tspan style={mono} fill="var(--color-brand-600)">?</tspan> tranché par le voisinage ·{' '}
            <tspan style={mono} fill="var(--color-brand-600)">−</tspan> veto
          </text>

          <line x1="178" y1="340" x2="178" y2="360" stroke="var(--color-ink-400)" strokeWidth="1.3"
            markerEnd="url(#fleche)" />
          <text x="186" y="353" fontSize="9" fill="var(--color-ink-400)" style={mono}>npm run indexer</text>

          {/* 5 — l'indexation */}
          <rect x="30" y="364" width="296" height="74" {...boite} />
          <text x="178" y="383" {...titre}>Indexation</text>
          <text x="178" y="398" {...detail}>recherche sur le texte continu d'une séance</text>
          <text x="178" y="410" {...detail}>deux mentions à moins de 45 s n'en font qu'une</text>
          <text x="178" y="422" {...detail}>un mot partagé se tranche sur ±600 caractères</text>
          <text x="178" y="433" {...detail}>à égalité, la mention est abandonnée</text>

          <line x1="178" y1="442" x2="178" y2="460" stroke="var(--color-ink-400)" strokeWidth="1.3"
            markerEnd="url(#fleche)" />

          {/* 6 — ce qui est publié */}
          <rect x="30" y="464" width="296" height="50" {...boite} />
          <text x="178" y="483" {...titre} style={mono}>occurrences.json</text>
          <text x="178" y="498" {...detail}>identifiants de vidéo, de terme, et secondes</text>
          <text x="178" y="509" {...detail}>aucun mot du cours n'y figure</text>

          <line x1="178" y1="518" x2="178" y2="536" stroke="var(--color-ink-400)" strokeWidth="1.3"
            markerEnd="url(#fleche)" />

          {/* 7 — le site */}
          <rect x="30" y="540" width="296" height="44" rx="10" fill="var(--color-ink-100)"
            stroke="var(--color-ink-200)" strokeWidth="1.4" />
          <text x="178" y="559" {...titre}>morphologie.commutator.io</text>
          <text x="178" y="574" {...detail}>l'index, et les liens vers les séances</text>

          {/* 8 — l'oreille, qui n'est pas automatisable, et qui reboucle */}
          <rect x="30" y="600" width="296" height="56" rx="10" fill="var(--color-craie-100)"
            stroke="var(--color-craie-600)" strokeWidth="1.4" strokeDasharray="5 4" />
          <text x="178" y="620" fontSize="12" fontWeight="600" fill="var(--color-craie-700)" textAnchor="middle">
            Relecture à l'oreille
          </text>
          <text x="178" y="635" fontSize="9.5" fill="var(--color-craie-700)" textAnchor="middle">
            un passage douteux est écouté, et le verdict
          </text>
          <text x="178" y="647" fontSize="9.5" fill="var(--color-craie-700)" textAnchor="middle">
            devient une variante, un voisinage ou un veto
          </text>

          {/* la boucle : de l'oreille vers le lexique, qu'on refait tourner */}
          <path d="M30,628 L16,628 L16,296 L28,296" fill="none" stroke="var(--color-craie-600)"
            strokeWidth="1.3" strokeDasharray="5 4" markerEnd="url(#flecheClaire)" />
        </svg>
      </div>

      <p>
        La boucle est l'essentiel : aucune règle n'a été posée a priori. Chaque
        graphie fautive du lexique a d'abord été relevée dans le corpus, puis
        écoutée dans la séance, et n'y est entrée qu'une fois entendue.
      </p>
    </Section>
  );
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="titre text-xl leading-tight text-ink-900">{titre}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-ink-700">{children}</div>
    </section>
  );
}
