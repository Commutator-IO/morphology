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

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="titre text-xl leading-tight text-ink-900">{titre}</h2>
      <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-ink-700">{children}</div>
    </section>
  );
}
