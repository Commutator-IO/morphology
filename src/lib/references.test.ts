import { describe, expect, it } from 'vitest';
import occurrences from '../data/occurrences-references.json';
import { SEANCE_PAR_ID } from './lexique';
import {
  correspondReference,
  ORDRE_TYPES,
  passagesDeReference,
  REFERENCES,
  totalDeReference,
  TYPES,
} from './references';

/**
 * La liste des références est bâtie sur un tri manuel : chaque nom a été gardé
 * parce qu'on a lu le passage. Ces tests gardent les propriétés que ce tri
 * garantit, et surtout la dernière — un nom sans aucune mention signalerait
 * qu'on a laissé passer un candidat non vérifié.
 */

describe('références', () => {
  it('a des identifiants uniques', () => {
    const ids = REFERENCES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('donne à chacune un type connu et une note', () => {
    for (const r of REFERENCES) {
      expect(TYPES[r.type], r.id).toBeDefined();
      expect(ORDRE_TYPES, r.id).toContain(r.type);
      expect(r.note.length, r.id).toBeGreaterThan(40);
      expect(r.variantes.length, r.id).toBeGreaterThan(0);
    }
  });

  it('ne garde que des noms effectivement prononcés', () => {
    // Une référence sans mention viendrait d'un candidat non vérifié : la liste
    // est construite à partir des relevés, pas d'une anthologie plaquée dessus.
    for (const r of REFERENCES) {
      expect(totalDeReference(r.id), `${r.id} n'est cité nulle part`).toBeGreaterThan(0);
    }
  });

  it('ne cite que des séances connues, dans l’ordre du cours', () => {
    for (const r of REFERENCES) {
      const rangs = passagesDeReference(r.id).map((p) => p.seance.rang);
      expect(rangs, r.id).toEqual([...rangs].sort((a, b) => a - b));
    }
    for (const e of Object.values(occurrences.termes)) {
      for (const videoId of Object.keys(e.videos)) {
        expect(SEANCE_PAR_ID.get(videoId), videoId).toBeDefined();
      }
    }
  });

  it('place chaque horodatage dans la durée de sa séance', () => {
    for (const r of REFERENCES) {
      for (const { seance, instants } of passagesDeReference(r.id)) {
        for (const i of instants) {
          expect(i, `${r.id} / ${seance.id}`).toBeGreaterThanOrEqual(0);
          expect(i, `${r.id} / ${seance.id}`).toBeLessThanOrEqual(seance.dureeS ?? Infinity);
        }
      }
    }
  });

  it('accorde le total annoncé et les horodatages publiés', () => {
    for (const r of REFERENCES) {
      const n = passagesDeReference(r.id).reduce((s, p) => s + p.instants.length, 0);
      expect(n, r.id).toBe(totalDeReference(r.id));
    }
  });

  it('écarte les homonymes courants relevés à l’audit', () => {
    // « léger », « carrière », « boucher », « durer » apparaissent des dizaines
    // de fois dans les sous-titres, mais comme mots ordinaires. Les réadmettre
    // gonflerait la liste de références que Debord n'a jamais faites.
    const ids = new Set(REFERENCES.map((r) => r.id));
    for (const faux of ['leger', 'fernand-leger', 'carriere', 'boucher', 'durer']) {
      expect(ids, faux).not.toContain(faux);
    }
  });

  it('exclut les patronymes qui sont du vocabulaire du cours', () => {
    // Le pire des faux amis : un nom propre qui entre en collision avec le sujet
    // traité, et qui remonte donc précisément là où le cours en parle.
    // « carpeaux » transcrit carpo- (articulation carpo-métacarpienne),
    // « courbet » le verbe courber, « poussin » un fléchisseur du pouce.
    // Aucun des trois n'a de citation avérée : ils restent hors du relevé.
    const ids = new Set(REFERENCES.map((r) => r.id));
    for (const faux of ['carpeaux', 'courbet', 'bronzino']) {
      expect(ids, faux).not.toContain(faux);
    }
  });

  it('ne laisse aucun mot du cours servir de variante à lui seul', () => {
    // Poussin fait exception à la règle ci-dessus : Debord le cite une fois,
    // aux côtés du Tintoret, et une citation avérée a sa place au relevé. Mais
    // ce qui pollue l'index n'est pas l'entrée, c'est le mot nu — il vaut trois
    // fois sur quatre pour le fléchisseur du pouce. L'entrée n'existe donc qu'à
    // travers une locution, et c'est cet invariant-là qu'il faut tenir : aucune
    // de ces formes ne doit jamais redevenir une variante à elle seule.
    const NUS = new Set(['poussin', 'poussins', 'carpeaux', 'courbet', 'leger', 'boucher']);
    for (const r of REFERENCES) {
      for (const v of r.variantes) {
        expect(NUS, `${r.id} → « ${v} »`).not.toContain(v.trim());
      }
    }
  });

  it('cherche par nom comme par type', () => {
    const trouve = (q: string) =>
      REFERENCES.filter((r) => correspondReference(r, q)).map((r) => r.id);
    expect(trouve('rembrandt')).toContain('rembrandt');
    expect(trouve('michel ange')).toContain('michel-ange');
    expect(trouve('vinci')).toContain('leonard');
    expect(trouve('anatomiste')).toContain('vesale');
    expect(trouve('')).toHaveLength(REFERENCES.length);
  });
});

describe('liens de musée', () => {
  /** Les seuls domaines vérifiés à la main. Un lien ailleurs signalerait une
   *  URL écrite de mémoire — le mode d'erreur exact qu'on cherche à éviter : un
   *  ark du Louvre « plausible » s'est révélé désigner un cippe, pas la Vénus. */
  const DOMAINES = new Set([
    'www.artic.edu',
    'www.metmuseum.org',
    'www.louvre.fr',
    'www.museodelprado.es',
    'www.musee-orsay.fr',
    'www.petitpalais.paris.fr',
    'www.museivaticani.va',
    // Notices d'œuvre, ajoutées après avoir ouvert chaque URL dans un vrai
    // navigateur et relevé le titre de la page — le Louvre et le Mauritshuis
    // opposent une vérification anti-robot à toute requête automatique, si
    // bien qu'un contrôle par code HTTP ne prouverait rien.
    'collections.louvre.fr',
    'www.mauritshuis.nl',
    'www.parismuseescollections.paris.fr',
  ]);

  const avecLien = REFERENCES.filter((r) => r.musee);

  it('couvre une bonne part des références', () => {
    expect(avecLien.length).toBeGreaterThanOrEqual(40);
  });

  it('ne pointe que vers des domaines vérifiés, en https', () => {
    for (const r of avecLien) {
      const u = new URL(r.musee!.url);
      expect(u.protocol, r.id).toBe('https:');
      expect(DOMAINES, `${r.id} → ${u.hostname}`).toContain(u.hostname);
    }
  });

  it('nomme l’œuvre dès qu’il s’agit d’une collection', () => {
    for (const r of avecLien) {
      const collection = new URL(r.musee!.url).hostname.match(
        /artic|metmuseum|collections\.louvre|mauritshuis|parismuseescollections/,
      );
      if (collection) expect(r.musee!.oeuvre, r.id).toBeTruthy();
    }
  });

  it('donne à chaque lieu le site de son institution', () => {
    for (const r of REFERENCES.filter((x) => x.type === 'lieu')) {
      expect(r.musee, r.id).toBeDefined();
    }
  });

  it('laisse sans lien ce qui est encore sous droits', () => {
    // Picasso, Giacometti, Bacon, Miró, Masson, Balthus : aucune image en accès
    // libre n'existe, et en fabriquer un lien reviendrait à renvoyer vers une
    // reproduction non autorisée. L'absence est ici le résultat correct.
    for (const id of ['picasso', 'giacometti', 'bacon', 'miro', 'masson', 'balthus']) {
      const r = REFERENCES.find((x) => x.id === id);
      expect(r, id).toBeDefined();
      expect(r!.musee, `${id} ne devrait pas avoir de lien`).toBeUndefined();
    }
  });

  it('ne fait pas pointer deux références sur la même œuvre', () => {
    // L'invariant qui aurait attrapé la confusion tout seul : une recherche sur
    // « michelangelo » a rendu « The Musicians » de Michelangelo Merisi — le
    // Caravage — et l'a rangé sous Michel-Ange. Deux entrées renvoyant au même
    // tableau signalent presque toujours une homonymie mal tranchée.
    const urls = avecLien
      .filter((r) => r.musee!.oeuvre)
      .map((r) => r.musee!.url);
    expect(new Set(urls).size, 'deux références partagent une œuvre').toBe(urls.length);
  });

  it('ne confond pas Michel-Ange avec le Caravage', () => {
    // Buonarroti et Merisi portent le même prénom ; seul le patronyme distingue.
    const m = REFERENCES.find((r) => r.id === 'michel-ange');
    expect(m?.musee?.oeuvre ?? '').not.toContain('Musicians');
  });

  it('n’attribue pas une œuvre d’atelier au maître', () => {
    // « Follower of Leonardo », « Cecco del Caravaggio », « Antoine Masson » :
    // tous passaient le premier filtre par simple inclusion du patronyme.
    for (const r of avecLien) {
      const t = (r.musee!.oeuvre ?? '').toLowerCase();
      for (const q of ['follower of', 'workshop of', 'imitator of', 'circle of']) {
        expect(t, `${r.id} : ${t}`).not.toContain(q);
      }
    }
  });
});
