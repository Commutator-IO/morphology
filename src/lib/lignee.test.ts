import { describe, expect, it } from 'vitest';
import { FIGURES, parSection, SECTIONS } from './lignee';

/**
 * Une bibliographie est le genre d'objet qu'on remplit volontiers de mémoire,
 * et c'est là qu'on se trompe : un éditeur approximatif, une date décalée d'un
 * an, un ouvrage attribué au mauvais auteur. Ces tests imposent la règle du
 * site — rien n'est publié sans sa provenance.
 */
describe('lignée', () => {
  it('a des identifiants uniques', () => {
    const ids = FIGURES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('exige une provenance pour chaque entrée', () => {
    for (const f of FIGURES) {
      expect(f.source.length, `${f.id} sans source`).toBeGreaterThan(30);
      expect(f.notice.length, `${f.id}`).toBeGreaterThan(60);
    }
  });

  it('range chaque figure dans une section affichée', () => {
    const roles = new Set(SECTIONS.map((s) => s.role));
    for (const f of FIGURES) expect(roles, f.id).toContain(f.role);
    for (const s of SECTIONS) {
      expect(parSection(s.role).length, `section ${s.role} vide`).toBeGreaterThan(0);
    }
  });

  it('nomme chaque ouvrage, et n’invente pas de date', () => {
    for (const f of FIGURES) {
      for (const o of f.ouvrages) {
        expect(o.titre.length, f.id).toBeGreaterThan(5);
        // Une date est soit une année ou une fourchette, soit l'aveu qu'on ne
        // l'a pas vérifiée. Jamais une approximation présentée comme un fait.
        if (o.annee) {
          expect(o.annee, `${f.id} : ${o.annee}`).toMatch(/^(\d{4}(-\d{4})?|à confirmer)$/);
        }
      }
    }
  });

  it('ne renvoie qu’à des domaines vérifiés, en https', () => {
    const DOMAINES = new Set(['archive.org', 'www.editions-eyrolles.com']);
    for (const f of FIGURES) {
      for (const o of f.ouvrages.filter((x) => x.url)) {
        const u = new URL(o.url!);
        expect(u.protocol, f.id).toBe('https:');
        expect(DOMAINES, `${f.id} → ${u.hostname}`).toContain(u.hostname);
      }
    }
  });

  it('garde les deux fondateurs de la chaire et leurs numérisations', () => {
    const avant = parSection('avant').map((f) => f.id);
    expect(avant).toContain('richer');
    expect(avant).toContain('duval');
    const enLigne = FIGURES.flatMap((f) => f.ouvrages).filter((o) => o.url?.includes('archive.org'));
    expect(enLigne.length).toBeGreaterThanOrEqual(3);
  });
});
