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
 * The reference list rests on a manual sort: every name was kept because the
 * passage was read. These tests guard the properties that sort guarantees, and
 * above all the last one — a name with no mention at all would mean an
 * unverified candidate slipped through.
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
    // A reference with no mention would come from an unverified candidate: the list
    // is built from the surveys, not from an anthology laid over them.
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
    // "léger", "carrière", "boucher", "durer" appear dozens of times in the
    // subtitles, but as ordinary words. Readmitting them would swell the list with
    // references Debord never made.
    const ids = new Set(REFERENCES.map((r) => r.id));
    for (const faux of ['leger', 'fernand-leger', 'carriere', 'boucher', 'durer']) {
      expect(ids, faux).not.toContain(faux);
    }
  });

  it('exclut les patronymes qui sont du vocabulaire du cours', () => {
    // The worst kind of false friend: a proper name colliding with the subject
    // being taught, which therefore surfaces exactly where the course covers it.
    // "carpeaux" transcribes carpo- (the carpometacarpal joint), "courbet" the verb
    // courber, "poussin" a flexor of the thumb. None of the three has a confirmed
    // citation: they stay out of the survey.
    const ids = new Set(REFERENCES.map((r) => r.id));
    for (const faux of ['carpeaux', 'courbet', 'bronzino']) {
      expect(ids, faux).not.toContain(faux);
    }
  });

  it('ne laisse aucun mot du cours servir de variante à lui seul', () => {
    // Poussin is the exception to the rule above: Debord cites him once, beside
    // Tintoretto, and a confirmed citation belongs in the survey. But what pollutes
    // the index is not the entry, it is the bare word — three times out of four it
    // means the flexor of the thumb. The entry therefore exists only through a
    // phrase, and that is the invariant to hold: none of these forms may ever
    // become a variant on its own again.
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
  /** The only domains checked by hand. A link anywhere else would signal a URL
   *  written from memory — exactly the failure we are avoiding: a "plausible"
   *  Louvre ark turned out to designate a cippus, not the Venus. */
  const DOMAINES = new Set([
    'www.artic.edu',
    'www.metmuseum.org',
    'www.louvre.fr',
    'www.museodelprado.es',
    'www.musee-orsay.fr',
    'www.petitpalais.paris.fr',
    'www.museivaticani.va',
    // Work records, added after opening each URL in a real browser and reading the
    // page title — the Louvre and the Mauritshuis put a bot check in front of every
    // automated request, so an HTTP-code check would prove nothing.
    'collections.louvre.fr',
    'www.mauritshuis.nl',
    'www.parismuseescollections.paris.fr',
    // Book digitisations, for the anatomists: each page opened and its title read,
    // as for the work records.
    'archive.org',
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
        /artic|metmuseum|collections\.louvre|mauritshuis|parismuseescollections|archive\.org/,
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
    // Picasso, Giacometti, Bacon, Miró, Masson, Balthus: no freely accessible image
    // exists, and fabricating a link would mean pointing at an unauthorised
    // reproduction. Absence is the correct result here.
    for (const id of ['picasso', 'giacometti', 'bacon', 'miro', 'masson', 'balthus']) {
      const r = REFERENCES.find((x) => x.id === id);
      expect(r, id).toBeDefined();
      expect(r!.musee, `${id} ne devrait pas avoir de lien`).toBeUndefined();
    }
  });

  it('ne fait pas pointer deux références sur la même œuvre', () => {
    // The invariant that would have caught the mix-up on its own: a search for
    // "michelangelo" returned "The Musicians" by Michelangelo Merisi — Caravaggio —
    // and filed it under Michelangelo. Two entries pointing at the same painting
    // almost always mean a badly settled homonym.
    const urls = avecLien
      .filter((r) => r.musee!.oeuvre)
      .map((r) => r.musee!.url);
    expect(new Set(urls).size, 'deux références partagent une œuvre').toBe(urls.length);
  });

  it('ne confond pas Michel-Ange avec le Caravage', () => {
    // Buonarroti and Merisi share a first name; only the surname tells them apart.
    const m = REFERENCES.find((r) => r.id === 'michel-ange');
    expect(m?.musee?.oeuvre ?? '').not.toContain('Musicians');
  });

  it('n’attribue pas une œuvre d’atelier au maître', () => {
    // "Follower of Leonardo", "Cecco del Caravaggio", "Antoine Masson": all passed
    // the first filter by merely containing the surname.
    for (const r of avecLien) {
      const t = (r.musee!.oeuvre ?? '').toLowerCase();
      for (const q of ['follower of', 'workshop of', 'imitator of', 'circle of']) {
        expect(t, `${r.id} : ${t}`).not.toContain(q);
      }
    }
  });
});
