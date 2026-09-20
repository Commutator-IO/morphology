/**
 * Categories and regions: labels, colours, display order.
 *
 * In `src/lib/` rather than with the components: oxlint requires a component
 * module to export components only.
 */

export type Categorie = 'os' | 'muscle' | 'repere' | 'orientation' | 'morphologie';

/** A category carries a colour *and* a word: colour alone does not read in
 *  greyscale, nor for a colour-blind reader, nor in a sunlit studio. */
export const CATEGORIES: Record<Categorie, { libelle: string; puce: string; propos: string }> = {
  os: {
    libelle: 'Os',
    puce: 'border-os-200 bg-os-50 text-os-700',
    propos: "Le plan dur. Ce qui ne change pas de forme et fixe les proportions.",
  },
  muscle: {
    libelle: 'Muscle',
    puce: 'border-brand-200 bg-brand-50 text-brand-700',
    propos: "Ce qui gonfle, se creuse et change avec le mouvement.",
  },
  repere: {
    libelle: 'Repère',
    puce: 'border-craie-200 bg-craie-100 text-craie-700',
    propos: "Saillie ou creux palpable sous la peau, sur lequel on peut mesurer.",
  },
  orientation: {
    libelle: 'Orientation',
    puce: 'border-ink-300 bg-ink-100 text-ink-700',
    propos: "Les mots qui situent : avant, arrière, dedans, dehors, près, loin.",
  },
  morphologie: {
    libelle: 'Forme',
    puce: 'border-ink-200 bg-white text-ink-600',
    propos: "Le vocabulaire du modelé et de la construction, propre à l'atelier.",
  },
};

export const ORDRE_CATEGORIES: Categorie[] = [
  'os',
  'muscle',
  'repere',
  'morphologie',
  'orientation',
];

/** Regions, top to bottom then trunk outwards — the order in which one reads a
 *  body, more useful than alphabetical. */
export const REGIONS: Record<string, string> = {
  tete: 'Tête',
  cou: 'Cou',
  tronc: 'Tronc',
  dos: 'Dos',
  epaule: 'Épaule',
  bras: 'Bras',
  coude: 'Coude',
  'avant-bras': 'Avant-bras',
  main: 'Main',
  bassin: 'Bassin',
  cuisse: 'Cuisse',
  genou: 'Genou',
  jambe: 'Jambe',
  pied: 'Pied',
  general: 'Tout le corps',
};

export const ORDRE_REGIONS = Object.keys(REGIONS);

/**
 * Region groups, as one talks about a studio session: "yesterday I worked on
 * hands".
 *
 * The lexicon's fine regions (forearm, elbow, knee…) are too many to make
 * filters usable with a thumb, and nobody says "I studied the elbow". These
 * groups match how the course itself divides up: `parties` ties them to the
 * sessions, so one filter serves both sides.
 */
export const GROUPES: {
  id: string;
  libelle: string;
  regions: string[];
  parties: string[];
}[] = [
  { id: 'tete', libelle: 'Tête et cou', regions: ['tete', 'cou'], parties: ['tete'] },
  { id: 'torse', libelle: 'Torse', regions: ['tronc'], parties: ['tronc'] },
  // The back gets its own entry: it is the largest part of the course — six
  // sessions, because the shoulder blade slides over the rib cage — and folding
  // it into the torso hid what Debord spends most time on.
  { id: 'dos', libelle: 'Dos', regions: ['dos'], parties: ['dos'] },
  {
    id: 'bras',
    libelle: 'Épaule et bras',
    regions: ['epaule', 'bras', 'coude'],
    parties: ['epaule', 'bras'],
  },
  {
    id: 'main',
    libelle: 'Main',
    regions: ['avant-bras', 'main'],
    parties: ['avantbras-main'],
  },
  {
    id: 'jambe',
    libelle: 'Bassin et jambe',
    regions: ['bassin', 'cuisse', 'genou', 'jambe'],
    parties: ['membre-inferieur'],
  },
  { id: 'pied', libelle: 'Pied', regions: ['pied'], parties: ['pied'] },
];

export const GROUPE_PAR_ID = new Map(GROUPES.map((g) => [g.id, g]));

/**
 * The group a region belongs to, if any.
 *
 * Terms in the "general" region — aplomb, méplat, relief — have none: they hold
 * for the whole body, and surfacing them in every group would drown the filter
 * in words nobody asked for.
 */
export function groupeDeRegion(region: string): string | null {
  return GROUPES.find((g) => g.regions.includes(region))?.id ?? null;
}
