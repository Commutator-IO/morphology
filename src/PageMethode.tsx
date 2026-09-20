import { Entete, Pied } from './components/Cadre';
import { FENETRE_S, INDEX_GENERE, LEXIQUE, SEANCES, totalDe } from './lib/lexique';
import { REFERENCES, totalDeReference } from './lib/references';

/**
 * How the index is built, and what it is worth.
 *
 * A necessary page, not an appendix: the index rests on an automatic
 * transcription, and is therefore fallible. Anyone using it in class needs to
 * know which way it can be wrong — a timestamp landing beside the mark is
 * harmless if expected, and misleading if the index is taken as exhaustive.
 */
export function PageMethode() {
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
              L'ordre des séances est celui du catalogue de PSL.
            </b>{' '}
            Chaque notice y est datée, du 19 novembre 2002 au 27 mai 2003 : c'est
            l'ordre où le cours a été fait. La playlist YouTube, elle, commence
            par la fin de l'année. Le regroupement par région du corps, en
            revanche, est de notre fait et non de celui de Debord.
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
 * The chain, drawn.
 *
 * The page says all of it in prose already, but the order is what a reader must
 * keep: where each file comes from, at what point the course stops being
 * reproduced, and where a human ear steps in.
 *
 * Inline SVG, in the site's palette, with real text so it can be selected and
 * read aloud. No library: a dependency to draw eight rectangles would cost more
 * than it saves.
 */
function Chaine() {
  const boite = { fill: 'white', stroke: 'var(--color-ink-200)', strokeWidth: 1.4, rx: 10 };
  const titre = { fontSize: 12.5, fontWeight: 600, fill: 'var(--color-ink-900)', textAnchor: 'middle' as const };
  const detail = { fontSize: 9.5, fill: 'var(--color-ink-500)', textAnchor: 'middle' as const };
  const mono = { fontFamily: 'ui-monospace, Menlo, monospace' };
  const fleche = { stroke: 'var(--color-ink-400)', strokeWidth: 1.3, markerEnd: 'url(#fleche)' };

  return (
    <Section titre="La chaîne, d'un bout à l'autre">
      <p>
        Rien de ce qui descend cette chaîne n'est du texte du cours : à partir du
        lexique, on ne manipule plus que des identifiants et des secondes. La
        dernière étape est la seule qu'aucun fichier ne peut garantir.
      </p>

      <div className="card overflow-x-auto px-3 py-4">
        <svg
          viewBox="0 0 1040 330"
          className="w-full min-w-[720px]"
          role="img"
          aria-label="La chaîne : les 45 séances filmées donnent, par yt-dlp, des sous-titres automatiques jamais publiés ; ces sous-titres portent des erreurs de transcription — « pete rock » pour épitrochlée, « grand public » pour grand oblique — que le lexique recueille comme variantes, avec trois préfixes : accent strict, mot ambigu tranché par le voisinage, veto ; l'indexation produit un fichier d'identifiants et de secondes, d'où le site ; une relecture à l'oreille corrige le lexique et fait tout recommencer."
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <defs>
            <marker id="fleche" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9" fill="none" stroke="var(--color-ink-400)" strokeWidth="1.6" />
            </marker>
            <marker id="flecheCraie" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9" fill="none" stroke="var(--color-craie-600)" strokeWidth="1.6" />
            </marker>
            <marker id="flecheBrand" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,1 L9,5 L0,9" fill="none" stroke="var(--color-brand-300)" strokeWidth="1.6" />
            </marker>
          </defs>

          {/* 1 — la source */}
          <rect x="6" y="30" width="150" height="72" {...boite} />
          <text x="81" y="55" {...titre}>45 séances</text>
          <text x="81" y="72" {...detail}>YouTube · Bibnum, PSL</text>
          <text x="81" y="85" {...detail}>77 heures filmées</text>

          <line x1="160" y1="66" x2="202" y2="66" {...fleche} />
          <text x="181" y="52" fontSize="8.5" fill="var(--color-ink-400)" textAnchor="middle" style={mono}>yt-dlp</text>
          <text x="181" y="82" fontSize="8" fill="var(--color-ink-400)" textAnchor="middle">sous-titres</text>

          {/* 2 — les sous-titres, qui ne sortent pas d'ici */}
          <rect x="206" y="30" width="168" height="72" {...boite} />
          <text x="290" y="53" {...titre} style={mono}>transcripts/</text>
          <text x="290" y="69" {...detail}>59 Mo · non versionnés</text>
          <text x="290" y="82" {...detail}>jamais publiés — le texte</text>
          <text x="290" y="94" {...detail}>du cours s'arrête ici</text>

          <line x1="378" y1="66" x2="420" y2="66" {...fleche} />

          {/* 3 — le lexique */}
          <rect x="424" y="30" width="168" height="72" {...boite} />
          <text x="508" y="53" {...titre} style={mono}>lexique.json</text>
          <text x="508" y="70" {...detail}>le mot, ses flexions, et</text>
          <text x="508" y="82" {...detail}>les graphies fautives</text>
          <text x="508" y="95" fontSize="8.5" fill="var(--color-ink-500)" textAnchor="middle">
            <tspan style={mono} fill="var(--color-brand-600)">!</tspan> accent ·{' '}
            <tspan style={mono} fill="var(--color-brand-600)">?</tspan> voisinage ·{' '}
            <tspan style={mono} fill="var(--color-brand-600)">−</tspan> veto
          </text>

          <line x1="596" y1="66" x2="638" y2="66" {...fleche} />
          <text x="617" y="52" fontSize="8" fill="var(--color-ink-400)" textAnchor="middle" style={mono}>npm run</text>
          <text x="617" y="82" fontSize="8" fill="var(--color-ink-400)" textAnchor="middle" style={mono}>indexer</text>

          {/* 4 — l'indexation */}
          <rect x="642" y="30" width="168" height="72" {...boite} />
          <text x="726" y="51" {...titre}>Indexation</text>
          <text x="726" y="67" {...detail}>sur le texte continu</text>
          <text x="726" y="79" {...detail}>deux mentions à 45 s</text>
          <text x="726" y="91" {...detail}>n'en font qu'une</text>

          <line x1="814" y1="66" x2="856" y2="66" {...fleche} />

          {/* 5 — ce qui est publié */}
          <rect x="860" y="30" width="168" height="72" {...boite} />
          <text x="944" y="53" {...titre} style={mono}>occurrences</text>
          <text x="944" y="70" {...detail}>identifiants et secondes</text>
          <text x="944" y="83" {...detail}>aucun mot du cours</text>
          <text x="944" y="95" {...detail}>n'y figure</text>

          <line x1="944" y1="106" x2="944" y2="150" {...fleche} />

          {/* 6 — le site */}
          <rect x="860" y="154" width="168" height="52" rx="10" fill="var(--color-ink-100)"
            stroke="var(--color-ink-200)" strokeWidth="1.4" />
          <text x="944" y="176" {...titre}>le site</text>
          <text x="944" y="192" {...detail}>l'index et ses liens</text>

          {/* 7 — le défaut de la matière première, sous les sous-titres */}
          <line x1="290" y1="106" x2="290" y2="150" stroke="var(--color-brand-300)" strokeWidth="1.3"
            markerEnd="url(#flecheBrand)" />
          <rect x="150" y="154" width="290" height="88" rx="10" fill="var(--color-brand-50)"
            stroke="var(--color-brand-200)" strokeWidth="1.4" />
          <text x="295" y="176" fontSize="12" fontWeight="600" fill="var(--color-brand-700)" textAnchor="middle">
            Erreurs de transcription
          </text>
          <text x="295" y="193" fontSize="9.5" fill="var(--color-brand-700)" textAnchor="middle">
            la reconnaissance vocale n'a aucun modèle d'anatomie
          </text>
          <text x="295" y="209" fontSize="9.5" fill="var(--color-brand-700)" textAnchor="middle">
            « pete rock » pour épitrochlée · « grand public » pour
          </text>
          <text x="295" y="222" fontSize="9.5" fill="var(--color-brand-700)" textAnchor="middle">
            grand oblique · « numerus » pour humérus
          </text>
          <text x="295" y="235" fontSize="9" fill="var(--color-brand-600)" textAnchor="middle">
            relevées une par une, elles deviennent des variantes
          </text>

          <path d="M440,198 L466,198 L466,110" fill="none" stroke="var(--color-brand-300)"
            strokeWidth="1.3" markerEnd="url(#flecheBrand)" />

          {/* 8 — l'oreille, qui n'est pas automatisable, et qui reboucle */}
          <rect x="530" y="256" width="330" height="62" rx="10" fill="var(--color-craie-100)"
            stroke="var(--color-craie-600)" strokeWidth="1.4" strokeDasharray="5 4" />
          <text x="695" y="277" fontSize="12" fontWeight="600" fill="var(--color-craie-700)" textAnchor="middle">
            Relecture à l'oreille
          </text>
          <text x="695" y="293" fontSize="9.5" fill="var(--color-craie-700)" textAnchor="middle">
            un passage douteux est écouté, et le verdict devient
          </text>
          <text x="695" y="306" fontSize="9.5" fill="var(--color-craie-700)" textAnchor="middle">
            une variante, un voisinage ou un veto
          </text>

          <path d="M550,256 L550,110" fill="none" stroke="var(--color-craie-600)" strokeWidth="1.3"
            strokeDasharray="5 4" markerEnd="url(#flecheCraie)" />
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
