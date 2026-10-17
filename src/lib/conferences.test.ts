import { describe, expect, it } from 'vitest';
import occurrences from '../data/occurrences-conferences.json';
import {
  annee,
  CONFERENCES,
  dateLongue,
  duree,
  GROUPES_THEMES,
  horodatage,
  lienMp3,
  lireAncre,
  passagesDe,
  REPEREES,
  THEMES,
} from './conferences';

/**
 * The catalogue and the theme index are generated files. These tests keep them
 * consistent with each other and guard what must never be published: the text
 * of the recordings. CI cannot recompute the index (the transcripts are not
 * versioned), so it can only check it.
 */

describe('catalogue', () => {
  it('a des identifiants uniques et un son pour chaque conférence', () => {
    expect(new Set(CONFERENCES.map((c) => c.id)).size).toBe(CONFERENCES.length);
    for (const c of CONFERENCES) {
      expect(c.titre.length, c.id).toBeGreaterThan(0);
      expect(c.dureeS, c.id).toBeGreaterThan(0);
      expect(lienMp3(c), c.id).toMatch(/^https:\/\/bibnum\.explore\.psl\.eu\/iiif\/3\/.+\.mp3$/);
    }
  });

  it('donne à chaque conférence une date ISO, ou une année seule', () => {
    for (const c of CONFERENCES) {
      expect(c.date, c.id).toMatch(/^\d{4}(-\d{2}-\d{2})?$/);
    }
  });
});

describe('thèmes', () => {
  it('ont des identifiants uniques et un groupe connu', () => {
    expect(new Set(THEMES.map((t) => t.id)).size).toBe(THEMES.length);
    const groupes = GROUPES_THEMES.map((g) => g.id);
    for (const t of THEMES) expect(groupes, t.id).toContain(t.groupe);
  });

  it("ont tous un relevé, même vide, dans l'index publié", () => {
    for (const t of THEMES) {
      expect(Object.keys(occurrences.termes), t.id).toContain(t.id);
    }
  });

  it('ne repèrent que des conférences du catalogue, à des instants dans leur durée', () => {
    const duree = new Map(CONFERENCES.map((c) => [c.id, c.dureeS]));
    for (const t of THEMES) {
      for (const { conference, instants } of passagesDe(t.id)) {
        expect(duree.has(conference.id), `${t.id} : ${conference.id}`).toBe(true);
        expect(instants, `${t.id} : ${conference.id}`).toEqual([...instants].sort((a, b) => a - b));
        for (const s of instants) {
          expect(s, `${t.id} : ${conference.id}`).toBeGreaterThanOrEqual(0);
          expect(s, `${t.id} : ${conference.id}`).toBeLessThan(duree.get(conference.id)!);
        }
      }
    }
  });

  it("comptent autant de passages que l'index le dit", () => {
    for (const t of THEMES) {
      const n = passagesDe(t.id).reduce((s, p) => s + p.instants.length, 0);
      const releve = (occurrences.termes as Record<string, { total: number }>)[t.id];
      expect(n, t.id).toBe(releve.total);
    }
  });

  it('repèrent au moins une conférence chacun', () => {
    for (const t of THEMES) expect(passagesDe(t.id).length, t.id).toBeGreaterThan(0);
    expect(REPEREES.size).toBeGreaterThan(0);
  });
});

describe("l'index publié ne contient aucun texte", () => {
  it("n'a que des comptes et des instants sous chaque thème", () => {
    for (const [id, releve] of Object.entries(occurrences.termes)) {
      expect(Object.keys(releve).sort(), id).toEqual(['total', 'videos']);
      for (const instants of Object.values(releve.videos)) {
        expect(instants.every((s) => Number.isInteger(s)), id).toBe(true);
      }
    }
  });
});

describe('affichage', () => {
  it('écrit les dates à mesure de ce que la notice donne', () => {
    expect(dateLongue('1996-10-06')).toBe('6 octobre 1996');
    expect(dateLongue('1996-10')).toBe('octobre 1996');
    expect(dateLongue('1996')).toBe('1996');
    expect(annee({ ...CONFERENCES[0], date: '1996-10-06' })).toBe('1996');
  });

  it('écrit les durées et les repères', () => {
    expect(duree(2280)).toBe('38 min');
    expect(duree(4020)).toBe('1 h 07');
    expect(horodatage(754)).toBe('12:34');
    expect(horodatage(3725)).toBe('1:02:05');
  });

  it("lit l'ancre d'un lien partagé", () => {
    expect(lireAncre('#2nhq0@754')).toEqual({ id: '2nhq0', instant: 754 });
    expect(lireAncre('#2nhq0')).toEqual({ id: '2nhq0', instant: 0 });
    expect(lireAncre('#')).toBeNull();
    expect(lireAncre('')).toBeNull();
  });
});
