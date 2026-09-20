import { Entete, Pied } from './components/Cadre';
import { LEXIQUE, SEANCES } from './lib/lexique';
import { REFERENCES } from './lib/references';

/**
 * Legal notice, and the site's position on rights.
 *
 * It exists for a precise reason: the course is not openly licensed. Every
 * record in the Bibnum catalogue carries "Tous droits réservés" and names three
 * holders. So this site cannot present itself as working on free ground; it must
 * say exactly what it does, on what basis, and how to obtain a takedown. Saying
 * it oneself, clearly and first, beats explaining it afterwards.
 *
 * Deliberately outside the tab bar: six tabs already scroll on a phone, and this
 * is looked for in the footer, where people look for it.
 */
export function PageMentions() {
  return (
    <>
      <Entete chemin="/mentions/" />

      <main className="mx-auto max-w-3xl px-4 pb-16">
        <h1 className="titre mt-6 text-2xl leading-tight text-ink-900 sm:text-3xl">
          Mentions légales
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
          Ce site est un index de travail. Il ne diffuse pas le cours de
          Jean-François Debord : il indique où l'écouter, chez celui qui le
          publie.
        </p>

        <Section titre="Éditeur">
          <p>
            Commutator —{' '}
            <a href="https://www.commutator.io" className="lien">
              www.commutator.io
            </a>
            . Directeur de la publication : Michel Hua. Contact :{' '}
            <a href="mailto:michel@commutator.io" className="lien">
              michel@commutator.io
            </a>
            .
          </p>
          <p>
            Hébergement : GitHub Pages, GitHub&nbsp;Inc., 88 Colin P. Kelly Jr
            Street, San Francisco, CA 94107, États-Unis. Le{' '}
            <a
              href="https://github.com/Commutator-IO/morphology"
              target="_blank"
              rel="noreferrer"
              className="lien"
            >
              code source
            </a>{' '}
            est public.
          </p>
        </Section>

        <Section titre="Ce que ce site contient, et ce qu'il ne contient pas">
          <p>
            Il contient un lexique de {LEXIQUE.length} termes et{' '}
            {REFERENCES.length} notices de références artistiques, écrites pour ce
            site, ainsi qu'un index d'horodatages renvoyant aux{' '}
            {SEANCES.length} séances publiées sur YouTube.
          </p>
          <p>
            Il n'héberge aucune vidéo. Les séances sont lues depuis le lecteur de
            YouTube, que l'Université PSL a laissé actif pour ces vidéos ; les
            liens horodatés pointent vers leur chaîne.
          </p>
          <p className="font-medium text-ink-900">
            Les transcriptions automatiques ayant servi à fabriquer l'index ne
            sont pas publiées et ne le seront pas. Elles restent hors du dépôt.
            On ne peut pas lire le cours ici, seulement trouver où l'écouter.
          </p>
        </Section>

        <Section titre="Droits sur le cours">
          <p>
            Le cours n'est pas sous licence ouverte. Le catalogue Bibnum de
            l'Université PSL porte la mention «&nbsp;Tous droits
            réservés&nbsp;» et nomme trois détenteurs : Jean-François Debord et
            ses ayants droit, les Beaux-Arts de Paris, et l'Université PSL pour
            la numérisation. Les séances ont été réalisées par Cyril de
            Turckheim — que le catalogue Bibnum crédite comme réalisateur sans
            le compter parmi les détenteurs.
          </p>
          <p>
            Ce site invoque, pour ce qu'il publie, l'exception de courte citation
            à des fins pédagogiques, avec indication du nom de l'auteur et de la
            source. L'index lui-même — un mot, un horodatage — est une donnée
            dérivée et non la reprise d'une expression. Sa fabrication relève de
            l'exception de fouille de textes et de données, l'accès aux séances
            ayant été licite et public.
          </p>
        </Section>

        <Section titre="Le catalogue Bibnum">
          <p>
            L'Université PSL tient le{' '}
            <a
              href="https://bibnum.explore.psl.eu/s/psl/ark:/18469/290s8"
              target="_blank"
              rel="noreferrer"
              className="lien"
            >
              catalogue de référence du fonds Debord
            </a>{' '}
            : 45 notices documentaires, chapitrées et indexées à la main par des
            bibliothécaires. C'est un travail distinct du nôtre et supérieur en
            autorité ; nous y renvoyons plutôt que de le refaire.
          </p>
          <p>
            Bibnum est protégé contre la collecte automatisée. Ce site le cite et
            y renvoie, ne le moissonne pas, et n'en reproduit pas les notices.
          </p>
        </Section>

        <Section titre="Retrait">
          <p>
            Tout ayant droit — les héritiers de Jean-François Debord, les
            Beaux-Arts de Paris, l'Université PSL — qui souhaiterait le retrait
            de tout ou partie de ce site peut écrire à{' '}
            <a href="mailto:michel@commutator.io" className="lien">
              michel@commutator.io
            </a>
            . La demande sera exécutée sous 48 heures, sans discussion préalable.
            Il en va de même pour toute personne citée dans la page Lignée.
          </p>
        </Section>

        <Section titre="Données personnelles">
          <p>
            Ce site ne dépose aucun cookie, n'utilise aucun outil de mesure
            d'audience et ne collecte aucune donnée personnelle. Le lecteur vidéo
            passe par <code className="text-[13px]">youtube-nocookie.com</code>.
          </p>
          <p>
            Deux préférences d'affichage — filtres dépliés ou non, taille du
            lecteur — sont conservées dans le navigateur, sur l'appareil, et ne
            sont transmises nulle part.
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
