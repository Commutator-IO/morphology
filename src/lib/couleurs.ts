/**
 * Catégories et régions : libellés, couleurs, ordre d'affichage.
 *
 * Dans `src/lib/` et non dans un fichier de composants : oxlint exige qu'un
 * module de composants n'exporte que des composants.
 */

export type Categorie = 'os' | 'muscle' | 'repere' | 'orientation' | 'morphologie';

/** Une catégorie porte une couleur *et* un mot : la couleur seule ne se lit pas
 *  en niveaux de gris, ni pour un daltonien, ni sous le soleil d'un atelier. */
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

/** Régions, de haut en bas puis du tronc vers les extrémités — l'ordre dans
 *  lequel on parcourt un corps, plus utile qu'un classement alphabétique. */
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
 * Groupes de régions, tels qu'on parle d'une séance d'atelier : « hier j'ai
 * travaillé les mains ».
 *
 * Les régions fines du lexique (avant-bras, coude, genou…) sont trop
 * nombreuses pour faire des filtres utilisables au pouce, et personne ne dit
 * « j'ai étudié le coude ». Ces six groupes correspondent à la façon dont le
 * cours lui-même se découpe : `parties` fait le lien avec les séances, pour
 * qu'un même filtre vaille des deux côtés.
 */
export const GROUPES: {
  id: string;
  libelle: string;
  regions: string[];
  parties: string[];
}[] = [
  { id: 'tete', libelle: 'Tête et cou', regions: ['tete', 'cou'], parties: ['tete'] },
  { id: 'torse', libelle: 'Torse', regions: ['tronc', 'dos'], parties: ['tronc', 'dos'] },
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
 * Le groupe auquel appartient une région, s'il y en a un.
 *
 * Les termes de région « general » — aplomb, méplat, relief — n'en ont aucun :
 * ils valent pour tout le corps, et les faire remonter dans chaque groupe
 * noierait le filtre sous des mots qu'on n'a pas cherchés.
 */
export function groupeDeRegion(region: string): string | null {
  return GROUPES.find((g) => g.regions.includes(region))?.id ?? null;
}
