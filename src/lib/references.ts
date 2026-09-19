/**
 * Les références artistiques citées dans le cours : peintres, sculpteurs,
 * anatomistes, musées, œuvres.
 *
 * La liste n'est pas une anthologie de l'histoire de l'art : elle ne contient
 * que des noms dont on a vérifié, en lisant le passage, qu'ils sont bien
 * prononcés comme références. Le tri a été nécessaire — la transcription
 * automatique confond « léger » l'adjectif avec un nom propre, « carrière » avec
 * un patronyme, « durer » avec Dürer. Ces faux amis ont été écartés un par un,
 * et c'est pourquoi la liste est plus courte que ce qu'un relevé brut donnerait.
 */
import referencesBrut from '../data/references.json';
import occurrencesBrut from '../data/occurrences-references.json';
import { pliage, SEANCE_PAR_ID, type Seance } from './lexique';

export type TypeReference = 'peintre' | 'sculpteur' | 'anatomiste' | 'lieu' | 'oeuvre';

export type Reference = {
  id: string;
  nom: string;
  type: TypeReference;
  dates?: string;
  note: string;
  variantes: string[];
  /**
   * Une page de musée qui diffuse publiquement l'image d'une œuvre.
   *
   * Ce n'est pas l'œuvre que Debord projetait : les sous-titres ne donnent pas
   * les titres des diapositives, et les inventer serait pire que se taire. On
   * renvoie donc à une œuvre de la personne, dans une collection dont l'image
   * est en accès libre — de quoi mettre un visage sur un nom sans rien
   * affirmer de faux. Les entrées « lieu » renvoient au site de l'institution.
   */
  musee?: { nom: string; url: string; oeuvre?: string; date?: string };
};

export const REFERENCES = referencesBrut as Reference[];

const OCC = occurrencesBrut as {
  genere: string;
  termes: Record<string, { total: number; videos: Record<string, number[]> }>;
};

export const REFERENCES_GENERE = OCC.genere;

/** Libellés et ordre : les créateurs d'abord, puis où aller voir les œuvres. */
export const TYPES: Record<TypeReference, { libelle: string; pluriel: string; puce: string }> = {
  peintre: { libelle: 'Peintre', pluriel: 'Peintres', puce: 'border-brand-200 bg-brand-50 text-brand-700' },
  sculpteur: { libelle: 'Sculpteur', pluriel: 'Sculpteurs', puce: 'border-os-200 bg-os-50 text-os-700' },
  anatomiste: { libelle: 'Anatomiste', pluriel: 'Anatomistes', puce: 'border-craie-200 bg-craie-100 text-craie-700' },
  oeuvre: { libelle: 'Œuvre', pluriel: 'Œuvres', puce: 'border-ink-300 bg-ink-100 text-ink-700' },
  lieu: { libelle: 'Lieu', pluriel: 'Musées et lieux', puce: 'border-ink-200 bg-white text-ink-600' },
};

export const ORDRE_TYPES: TypeReference[] = [
  'peintre',
  'sculpteur',
  'anatomiste',
  'oeuvre',
  'lieu',
];

export type PassageRef = { seance: Seance; instants: number[] };

export function passagesDeReference(id: string): PassageRef[] {
  const e = OCC.termes[id];
  if (!e) return [];
  return Object.entries(e.videos)
    .map(([videoId, instants]) => ({ seance: SEANCE_PAR_ID.get(videoId)!, instants }))
    .filter((p) => p.seance)
    .sort((a, b) => a.seance.rang - b.seance.rang);
}

export function totalDeReference(id: string): number {
  return OCC.termes[id]?.total ?? 0;
}

const CIBLE = new Map(
  REFERENCES.map((r) => [r.id, pliage([r.nom, r.type, ...r.variantes].join(' '))]),
);

export function correspondReference(r: Reference, requete: string): boolean {
  const q = pliage(requete);
  if (!q) return true;
  const cible = CIBLE.get(r.id) ?? '';
  return q.split(' ').every((mot) => cible.includes(mot));
}

/** Tri par nom, accents ignorés — « Véronèse » se range à V, pas après Z. */
export const parNom = (a: Reference, b: Reference) =>
  a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
