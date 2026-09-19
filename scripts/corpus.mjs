/**
 * Lecture des sous-titres json3 et normalisation du texte.
 *
 * Deux normalisations, de même longueur caractère pour caractère, afin qu'une
 * position trouvée dans l'une désigne le même endroit dans l'autre :
 *
 *   - `plier`      : accents rabattus sur l'ASCII. Tolérant, c'est le défaut :
 *                    l'ASR écrit « sterno cléido » aussi bien que « sternocleido ».
 *   - `accentuer`  : accents conservés. Nécessaire pour les quelques mots que
 *                    l'accent seul distingue — « côte » la côte et « côté » le
 *                    côté, qui sans lui se confondent et noient l'index.
 *
 * Le repli one-to-one (é → e) est préférable à NFD suivi d'une suppression des
 * diacritiques : NFD change la longueur de la chaîne, et les deux textes ne
 * seraient plus alignés.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const DOSSIER = new URL('../transcripts/', import.meta.url).pathname;

const ACCENTS = 'àâäáãåçéèêëíìîïñóòôöõúùûüýÿœæ';
const PLIES = /*  */ 'aaaaaaceeeeiiiinooooouuuuyyoa';

/** Minuscules, ponctuation ramenée à l'espace, accents conservés. */
export function accentuer(s) {
  let out = '';
  for (const c of s.toLowerCase().normalize('NFC')) {
    if (/[a-z0-9]/.test(c) || ACCENTS.includes(c)) out += c;
    else out += ' ';
  }
  return out;
}

/** Comme `accentuer`, accents rabattus. Même longueur, mêmes positions. */
export function plier(s) {
  let out = '';
  for (const c of accentuer(s)) {
    const i = ACCENTS.indexOf(c);
    out += i === -1 ? c : PLIES[i];
  }
  return out;
}

/** Normalisation d'un motif de recherche : espaces réduits, bords nettoyés. */
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
      // Les mentions de régie — « [Applaudissements] » — ne sont pas du discours.
      if (!texte || texte.startsWith('[')) continue;
      segments.push({ t: Math.floor(e.tStartMs / 1000), texte });
    }
    out.push({ id, segments });
  }
  return out;
}

/** Compat : l'outil de fréquences travaille sur l'ASCII. */
export const normaliser = (s) => motif(s);
