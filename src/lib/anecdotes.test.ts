import { describe, expect, it } from 'vitest';
import brut from '../data/anecdotes.json';
import { CATEGORIES, grouperParSeance, MOMENTS, ORDRE } from './anecdotes';
import { SEANCE_PAR_ID } from './lexique';

/**
 * This survey is the only one on the site touching spoken content rather than
 * vocabulary. So the tests mainly watch one thing: that it publishes nothing
 * but pointers.
 */
describe('anecdotes', () => {
  it('ne publie aucun texte de transcription', () => {
    // The invariant that matters. The file must hold identifiers, moments and one
    // isolated word — never a sentence of the course. A word taken in context would
    // be enough to reproduce what Debord says, and to put in his mouth what the
    // transcription may have invented.
    const champsAutorises = new Set(['video', 't', 'mot', 'categorie', 'note', 'comparaison']);
    for (const m of MOMENTS) {
      for (const k of Object.keys(m)) expect(champsAutorises, k).toContain(k);
      expect(m.mot.split(/\s+/).length, `« ${m.mot} » est trop long`).toBeLessThanOrEqual(4);
      expect(m.mot.length, m.mot).toBeLessThanOrEqual(24);
    }
  });

  it('ne cite que des séances connues', () => {
    for (const m of MOMENTS) expect(SEANCE_PAR_ID.get(m.video), m.video).toBeDefined();
  });

  it('place chaque repère dans la durée de sa séance', () => {
    for (const { seance, moments } of grouperParSeance(MOMENTS)) {
      for (const m of moments) {
        expect(m.t, `${seance.id}`).toBeGreaterThanOrEqual(0);
        expect(m.t, `${seance.id}`).toBeLessThanOrEqual(seance.dureeS ?? Infinity);
      }
    }
  });

  it('respecte la fenêtre de fusion au sein d’une séance', () => {
    for (const { seance, moments } of grouperParSeance(MOMENTS)) {
      for (let i = 1; i < moments.length; i++) {
        expect(
          moments[i].t - moments[i - 1].t,
          `${seance.id} : ${moments[i - 1].t} → ${moments[i].t}`,
        ).toBeGreaterThanOrEqual(brut.fenetreS - 1);
      }
    }
  });

  it('donne à chaque repère une catégorie déclarée', () => {
    for (const m of MOMENTS) {
      expect(ORDRE, m.mot).toContain(m.categorie);
      expect(CATEGORIES[m.categorie]).toBeDefined();
    }
  });

  it('garde les notices courtes, deux ou trois phrases', () => {
    // A note says what the digression is about; it does not retell it. The limit
    // keeps the page an index rather than a rewrite of the course.
    for (const m of MOMENTS.filter((x) => x.note)) {
      expect(m.note!.length, `${m.video}|${m.t}`).toBeLessThanOrEqual(400);
      const phrases = m.note!.split(/[.!?]\s/).length;
      expect(phrases, `${m.video}|${m.t}`).toBeLessThanOrEqual(3);
    }
    expect(MOMENTS.filter((x) => x.note).length).toBeGreaterThanOrEqual(60);
  });

  it('marque des comparaisons hors art, toutes décrites', () => {
    const c = MOMENTS.filter((m) => m.comparaison);
    expect(c.length).toBeGreaterThanOrEqual(15);
    for (const m of c) expect(m.note, `${m.video}|${m.t}`).toBeTruthy();
  });

  it('range les repères d’une séance dans l’ordre du cours', () => {
    for (const { seance, moments } of grouperParSeance(MOMENTS)) {
      const ts = moments.map((m) => m.t);
      expect(ts, seance.id).toEqual([...ts].sort((a, b) => a - b));
    }
  });
});
