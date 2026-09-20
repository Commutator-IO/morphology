/**
 * The artistic references cited in the course: painters, sculptors, anatomists,
 * museums, works.
 *
 * The list is not an anthology of art history: it holds only names checked
 * against their passage and found to be spoken as references. The sorting was
 * necessary — the automatic transcription confuses the adjective "léger" with
 * the painter, "carrière" with the surname, "durer" with Dürer. These false
 * friends were dropped one by one, which is why the list is shorter than a raw
 * survey would give.
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
   * A museum page publicly showing an image of a work.
   *
   * It is not the work Debord projected: the subtitles give no slide titles,
   * and inventing them would be worse than silence. So we link to a work by
   * that person, in a collection whose image is freely accessible — enough to
   * put a face to a name without asserting anything false. "Lieu" entries link
   * to the institution's own site.
   */
  musee?: { nom: string; url: string; oeuvre?: string; date?: string };
};

export const REFERENCES = referencesBrut as Reference[];

const OCC = occurrencesBrut as {
  genere: string;
  termes: Record<string, { total: number; videos: Record<string, number[]> }>;
};

export const REFERENCES_GENERE = OCC.genere;

/** Labels and order: makers first, then where to go and see the works. */
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

/** Sort by name, accents ignored — "Véronèse" files under V, not after Z. */
export const parNom = (a: Reference, b: Reference) =>
  a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
