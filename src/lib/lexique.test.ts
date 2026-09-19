import { describe, expect, it } from 'vitest';
import occurrences from '../data/occurrences.json';
import {
  correspond,
  duree,
  FENETRE_S,
  horodate,
  LEXIQUE,
  PARTIES,
  passagesDe,
  pliage,
  SEANCE_PAR_ID,
  SEANCES,
  totalDe,
} from './lexique';
import { CATEGORIES, GROUPES, groupeDeRegion, REGIONS } from './couleurs';

/**
 * L'index publié est un fichier généré : ces tests vérifient qu'il est cohérent
 * avec le lexique et avec les séances, et qu'il n'a pas été committé dans un état
 * intermédiaire. Ils tiennent lieu de garde-fou en CI, où les transcriptions —
 * non versionnées — ne sont pas là pour le recalculer.
 */

describe('lexique', () => {
  it('a des identifiants uniques', () => {
    const ids = LEXIQUE.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('donne à chaque terme une catégorie et une région connues', () => {
    for (const t of LEXIQUE) {
      expect(CATEGORIES[t.categorie], `${t.id} : catégorie ${t.categorie}`).toBeDefined();
      expect(REGIONS[t.region], `${t.id} : région ${t.region}`).toBeDefined();
    }
  });

  it('donne à chaque terme une définition et au moins une variante à chercher', () => {
    for (const t of LEXIQUE) {
      expect(t.definition.length, `${t.id}`).toBeGreaterThan(40);
      expect(t.variantes.length, `${t.id}`).toBeGreaterThan(0);
    }
  });
});

describe('séances', () => {
  it('couvre les 45 séances du corpus, sans doublon', () => {
    expect(SEANCES).toHaveLength(45);
    expect(new Set(SEANCES.map((s) => s.id)).size).toBe(45);
    expect(SEANCES.map((s) => s.rang)).toEqual([...Array(45)].map((_, i) => i + 1));
  });

  it('range chaque séance dans une partie déclarée', () => {
    const connues = new Set(PARTIES.map((p) => p.id));
    for (const s of SEANCES) expect(connues, `séance ${s.rang}`).toContain(s.partie);
  });

  it('ne laisse aucune partie vide', () => {
    for (const p of PARTIES) {
      expect(SEANCES.some((s) => s.partie === p.id), p.id).toBe(true);
    }
  });
});

describe('index des passages', () => {
  it('ne cite que des termes du lexique', () => {
    const ids = new Set(LEXIQUE.map((t) => t.id));
    for (const id of Object.keys(occurrences.termes)) expect(ids).toContain(id);
  });

  it('couvre tout le lexique, y compris les termes sans passage', () => {
    for (const t of LEXIQUE) expect(Object.keys(occurrences.termes)).toContain(t.id);
  });

  it('ne cite que des séances connues', () => {
    for (const [, e] of Object.entries(occurrences.termes)) {
      for (const videoId of Object.keys(e.videos)) {
        expect(SEANCE_PAR_ID.get(videoId), videoId).toBeDefined();
      }
    }
  });

  it('place chaque horodatage dans la durée de sa séance', () => {
    // L'invariant qui attrape une erreur de conversion ou de décalage : un
    // horodatage au-delà de la fin renvoie vers une vidéo qui s'arrête aussitôt.
    for (const t of LEXIQUE) {
      for (const { seance, instants } of passagesDe(t.id)) {
        for (const i of instants) {
          expect(i, `${t.id} / ${seance.id}`).toBeGreaterThanOrEqual(0);
          expect(i, `${t.id} / ${seance.id}`).toBeLessThanOrEqual(seance.dureeS ?? Infinity);
        }
      }
    }
  });

  it('respecte la fenêtre de fusion entre deux horodatages voisins', () => {
    for (const t of LEXIQUE) {
      for (const { seance, instants } of passagesDe(t.id)) {
        for (let k = 1; k < instants.length; k++) {
          expect(
            instants[k] - instants[k - 1],
            `${t.id} / ${seance.id} : ${instants[k - 1]} → ${instants[k]}`,
          ).toBeGreaterThanOrEqual(FENETRE_S);
        }
      }
    }
  });

  it('accorde le total annoncé et le nombre d’horodatages publiés', () => {
    for (const t of LEXIQUE) {
      const compte = passagesDe(t.id).reduce((s, p) => s + p.instants.length, 0);
      expect(compte, t.id).toBe(totalDe(t.id));
    }
  });

  it('rend les séances d’un terme dans l’ordre du cours', () => {
    for (const t of LEXIQUE) {
      const rangs = passagesDe(t.id).map((p) => p.seance.rang);
      expect(rangs, t.id).toEqual([...rangs].sort((a, b) => a - b));
    }
  });
});

describe('recherche', () => {
  const trouve = (q: string) => LEXIQUE.filter((t) => correspond(t, q)).map((t) => t.id);

  it('ignore les accents, que le clavier d’un téléphone ne donne pas volontiers', () => {
    expect(trouve('deltoide')).toContain('deltoide');
    expect(trouve('perone')).toContain('perone');
  });

  it('accepte la nomenclature internationale pour un terme classique', () => {
    // Sans cela l'index ne sert qu'à ceux qui connaissent déjà le mot de Debord.
    expect(trouve('scapula')).toContain('omoplate');
    expect(trouve('patella')).toContain('rotule');
    expect(trouve('ulna')).toContain('cubitus');
    expect(trouve('sartorius')).toContain('couturier');
    expect(trouve('fibula')).toContain('perone');
    expect(trouve('gastrocnemius')).toContain('jumeaux');
  });

  it('exige tous les mots de la requête', () => {
    expect(trouve('grand dorsal')).toEqual(['grand-dorsal']);
  });

  it('rend tout le lexique sur une requête vide', () => {
    expect(trouve('')).toHaveLength(LEXIQUE.length);
  });

  it('replie identiquement les formes accentuées et nues', () => {
    expect(pliage('Deltoïde')).toBe('deltoide');
    expect(pliage("l'épine iliaque")).toBe('l epine iliaque');
  });
});

describe('mise en forme', () => {
  it('horodate comme le lecteur YouTube', () => {
    expect(horodate(0)).toBe('0:00');
    expect(horodate(9)).toBe('0:09');
    expect(horodate(75)).toBe('1:15');
    expect(horodate(3600)).toBe('1:00:00');
    expect(horodate(3725)).toBe('1:02:05');
  });

  it('dit les durées de séance en heures', () => {
    expect(duree(null)).toBe('—');
    expect(duree(600)).toBe('10 min');
    expect(duree(6300)).toBe('1 h 45');
  });
});

describe('groupes de régions', () => {
  it('range chaque région du lexique dans un groupe, sauf « tout le corps »', () => {
    // Une région oubliée ferait disparaître ses termes de tous les filtres sans
    // que rien ne le signale : c'est le genre d'absence qu'on ne remarque pas.
    for (const region of new Set(LEXIQUE.map((t) => t.region))) {
      if (region === 'general') {
        expect(groupeDeRegion(region), region).toBeNull();
        continue;
      }
      expect(groupeDeRegion(region), `région ${region} sans groupe`).not.toBeNull();
    }
  });

  it('n’assigne jamais une région à deux groupes', () => {
    const vues = new Set<string>();
    for (const g of GROUPES) {
      for (const r of g.regions) {
        expect(vues, `${r} apparaît deux fois`).not.toContain(r);
        vues.add(r);
      }
    }
  });

  it('ne nomme que des régions et des parties qui existent', () => {
    const parties = new Set(PARTIES.map((p) => p.id));
    for (const g of GROUPES) {
      for (const r of g.regions) expect(REGIONS[r], `${g.id} → région ${r}`).toBeDefined();
      for (const p of g.parties) expect(parties, `${g.id} → partie ${p}`).toContain(p);
    }
  });

  it('laisse chaque groupe non vide des deux côtés', () => {
    // Un filtre qui ne rend rien est pire qu'un filtre absent.
    for (const g of GROUPES) {
      expect(LEXIQUE.some((t) => g.regions.includes(t.region)), `${g.id} : aucun terme`).toBe(true);
      expect(SEANCES.some((s) => g.parties.includes(s.partie)), `${g.id} : aucune séance`).toBe(true);
    }
  });
});
