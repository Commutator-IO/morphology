import { describe, expect, it } from 'vitest';
import brut from '../data/anecdotes.json';
import { CATEGORIES, grouperParSeance, MOMENTS, ORDRE } from './anecdotes';
import { SEANCE_PAR_ID } from './lexique';

/**
 * Ce relevé est le seul du site à toucher au contenu parlé plutôt qu'au
 * vocabulaire. Les tests y veillent donc surtout à une chose : qu'il n'en
 * publie rien d'autre que des repères.
 */
describe('anecdotes', () => {
  it('ne publie aucun texte de transcription', () => {
    // L'invariant qui compte. Le fichier ne doit contenir que des identifiants,
    // des instants et un mot isolé — jamais une phrase du cours. Un mot pris
    // dans son contexte suffirait à reproduire ce que Debord dit, et à lui
    // prêter des propos que la transcription a peut-être inventés.
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
    // Une notice dit de quoi parle la digression ; elle ne la raconte pas. La
    // borne est là pour que la page reste un index et ne devienne pas une
    // reprise du cours.
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
