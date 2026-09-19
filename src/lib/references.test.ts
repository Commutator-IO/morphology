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
