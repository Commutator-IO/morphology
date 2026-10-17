/**
 * Converts a Whisper JSON transcript into the json3 shape that
 * scripts/corpus.mjs reads: events with `tStartMs`, `dDurationMs` and `segs`.
 * Segment-level only; word timings stay in the -whisper.json next to it.
 *
 * usage: node whisper-vers-json3.mjs <in-whisper.json> <out.fr-orig.json3>
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [entree, sortie] = process.argv.slice(2);
if (!entree || !sortie) {
  console.error('usage: whisper-vers-json3.mjs <in-whisper.json> <out.fr-orig.json3>');
  process.exit(1);
}

const w = JSON.parse(readFileSync(entree, 'utf8'));
const events = (w.segments ?? [])
  .filter((s) => s.text?.trim())
  .map((s, i) => ({
    tStartMs: Math.round(s.start * 1000),
    dDurationMs: Math.round((s.end - s.start) * 1000),
    id: i + 1,
    segs: [{ utf8: s.text.trim() }],
  }));

writeFileSync(sortie, JSON.stringify({ wireMagic: 'pb3', events }, null, 1));
console.log(`${events.length} segments`);
