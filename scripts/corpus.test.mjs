import { describe, expect, it } from 'vitest';
import { accentuer, motif, plier } from './corpus.mjs';

/**
 * Le premier index donnait 655 relevés à « côtes » : en rabattant les accents,
 * « côté » — omniprésent à l'oral — se confondait avec « côte ». D'où deux textes
 * alignés, et des variantes que l'on peut exiger accentuées. Ces tests gardent
 * cette correction, qui est la seule raison d'être de la mécanique.
 */
describe('normalisation du corpus', () => {
  it('garde les deux textes alignés caractère par caractère', () => {
    // C'est ce qui permet d'horodater un relevé trouvé dans l'un avec l'autre.
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
    // Une ligature devient une seule lettre, et non « oe » : l'alignement des
    // deux textes impose un repli lettre pour lettre. Ce n'est pas la bonne
    // translittération française, c'est le prix de l'horodatage exact — et cela
    // n'empêche rien, « œ » ne figure dans aucun terme cherché.
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
