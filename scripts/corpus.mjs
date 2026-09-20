/**
 * Reads the json3 subtitles and normalises their text.
 *
 * Two normalisations, character-for-character the same length, so that a
 * position found in one points at the same place in the other:
 *
 *   - `plier`      : accents folded to ASCII. Lenient, and the default: the
 *                    ASR writes "sterno cléido" as readily as "sternocleido".
 *   - `accentuer`  : accents kept. Needed for the few words the accent alone
 *                    tells apart — "côte" the rib and "côté" the side, which
 *                    otherwise merge and drown the index.
 *
 * The one-to-one fold (é → e) beats NFD plus diacritic stripping: NFD changes
 * the string's length, and the two texts would no longer line up.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const DOSSIER = new URL('../transcripts/', import.meta.url).pathname;

const ACCENTS = 'àâäáãåçéèêëíìîïñóòôöõúùûüýÿœæ';
const PLIES = /*  */ 'aaaaaaceeeeiiiinooooouuuuyyoa';

/** Lowercase, punctuation turned into spaces, accents kept. */
export function accentuer(s) {
  let out = '';
  for (const c of s.toLowerCase().normalize('NFC')) {
    if (/[a-z0-9]/.test(c) || ACCENTS.includes(c)) out += c;
    else out += ' ';
  }
  return out;
}

/** Like `accentuer`, with accents folded. Same length, same offsets. */
export function plier(s) {
  let out = '';
  for (const c of accentuer(s)) {
    const i = ACCENTS.indexOf(c);
    out += i === -1 ? c : PLIES[i];
  }
  return out;
}

/** Normalises a search pattern: runs of spaces collapsed, edges trimmed. */
export function motif(s, avecAccents = false) {
  return (avecAccents ? accentuer(s) : plier(s)).replace(/\s+/g, ' ').trim();
}

export function lireCorpus() {
  const out = [];
  const fichiers = readdirSync(DOSSIER).filter((f) => f.endsWith('.fr-orig.json3')).sort();
  for (const f of fichiers) {
    const id = f.slice(0, f.indexOf('.fr-orig.json3'));
    const d = JSON.parse(readFileSync(join(DOSSIER, f), 'utf8'));
    const segments = [];
    for (const e of d.events ?? []) {
      if (!e.segs) continue;
      const texte = e.segs.map((s) => s.utf8 ?? '').join('').replace(/\s+/g, ' ').trim();
      // Stage cues — "[Applaudissements]" — are not speech.
      if (!texte || texte.startsWith('[')) continue;
      segments.push({ t: Math.floor(e.tStartMs / 1000), texte });
    }
    out.push({ id, segments });
  }
  return out;
}

/** Compatibility: the frequency tool works on ASCII. */
export const normaliser = (s) => motif(s);
