import { describe, expect, it } from 'vitest';
import { accentuer, motif, plier } from './corpus.mjs';

/**
 * The first index gave "côtes" 655 hits: with accents folded, "côté" — which
 * Debord says constantly — merged into "côte". Hence two aligned texts, and
 * variants that can demand their accents. These tests guard that fix, which is
 * the whole reason the machinery exists.
 */
describe('normalisation du corpus', () => {
  it('garde les deux textes alignés caractère par caractère', () => {
    // This is what lets a hit found in one text be timestamped from the other.
    const s = "La côte flottante, vue de ce côté-ci : l'épine, l'humérus.";
    expect(plier(s)).toHaveLength(accentuer(s).length);
  });

  it('distingue la côte du côté quand on garde les accents', () => {
    expect(accentuer('côte')).not.toBe(accentuer('côté'));
  });

  it('les confond quand on les rabat — ce pourquoi le mode strict existe', () => {
    expect(plier('côte')).toBe(plier('côté'));
  });

  it('rabat les accents sur l’ASCII sans changer la longueur', () => {
    expect(plier('épaule')).toBe('epaule');
    expect(plier('aponévrose')).toBe('aponevrose');
    // A ligature folds to one letter, not "oe": keeping the two texts aligned
    // forces a letter-for-letter fold. It is not correct French transliteration,
    // it is the price of exact timestamps — and it costs nothing here, since no
    // term we search for contains "œ".
    expect(plier('œil')).toBe('oil');
  });

  it('ramène la ponctuation à de l’espace, apostrophes comprises', () => {
    expect(motif("l'épine iliaque antéro-supérieure")).toBe(
      'l epine iliaque antero superieure',
    );
  });

  it('réduit les espaces d’un motif de recherche', () => {
    expect(motif('  crête   iliaque  ', true)).toBe('crête iliaque');
  });
});
