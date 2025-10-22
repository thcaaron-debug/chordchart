import type { Chord } from "@shared/schema";

// Musical notes in chromatic order
const NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// Common chord patterns to identify root note
const CHORD_PATTERNS = /^([A-G][#b]?)(.*)/;

/**
 * Parse a chord string to extract root note and suffix
 */
export function parseChord(chord: string): { root: string; suffix: string } | null {
  const match = chord.match(CHORD_PATTERNS);
  if (!match) return null;
  return {
    root: match[1],
    suffix: match[2] || "",
  };
}

/**
 * Transpose a single note by semitones
 */
export function transposeNote(note: string, semitones: number, preferFlats: boolean): string {
  const notes = preferFlats ? NOTES_FLAT : NOTES_SHARP;
  const currentIndex = notes.indexOf(note);
  
  if (currentIndex === -1) {
    // Try finding in the other notation
    const altNotes = preferFlats ? NOTES_SHARP : NOTES_FLAT;
    const altIndex = altNotes.indexOf(note);
    if (altIndex === -1) return note; // Invalid note
    
    // Convert to target notation
    const newIndex = (altIndex + semitones + 12) % 12;
    return notes[newIndex];
  }
  
  const newIndex = (currentIndex + semitones + 12) % 12;
  return notes[newIndex];
}

/**
 * Transpose a chord by semitones
 */
export function transposeChord(chord: string, semitones: number, preferFlats: boolean): string {
  const parsed = parseChord(chord);
  if (!parsed) return chord;
  
  const newRoot = transposeNote(parsed.root, semitones, preferFlats);
  
  // Handle slash chords (e.g., C/G)
  const slashMatch = parsed.suffix.match(/^(.*)\/([A-G][#b]?)$/);
  if (slashMatch) {
    const bassPart = slashMatch[1];
    const bassNote = slashMatch[2];
    const newBass = transposeNote(bassNote, semitones, preferFlats);
    return `${newRoot}${bassPart}/${newBass}`;
  }
  
  return `${newRoot}${parsed.suffix}`;
}

/**
 * Calculate semitone difference between two keys
 */
export function getKeyDistance(fromKey: string, toKey: string): number {
  const fromIndex = NOTES_SHARP.indexOf(fromKey);
  const toIndex = NOTES_SHARP.indexOf(toKey);
  
  if (fromIndex === -1 || toIndex === -1) {
    // Try flats
    const fromIndexFlat = NOTES_FLAT.indexOf(fromKey);
    const toIndexFlat = NOTES_FLAT.indexOf(toKey);
    if (fromIndexFlat === -1 || toIndexFlat === -1) return 0;
    return (toIndexFlat - fromIndexFlat + 12) % 12;
  }
  
  return (toIndex - fromIndex + 12) % 12;
}

/**
 * Common chords for autocomplete
 */
export const COMMON_CHORDS = [
  "C", "Cm", "C7", "Cmaj7", "Cm7", "Csus4", "Csus2", "Cdim", "Caug",
  "D", "Dm", "D7", "Dmaj7", "Dm7", "Dsus4", "Dsus2", "Ddim", "Daug",
  "E", "Em", "E7", "Emaj7", "Em7", "Esus4", "Esus2", "Edim", "Eaug",
  "F", "Fm", "F7", "Fmaj7", "Fm7", "Fsus4", "Fsus2", "Fdim", "Faug",
  "G", "Gm", "G7", "Gmaj7", "Gm7", "Gsus4", "Gsus2", "Gdim", "Gaug",
  "A", "Am", "A7", "Amaj7", "Am7", "Asus4", "Asus2", "Adim", "Aaug",
  "B", "Bm", "B7", "Bmaj7", "Bm7", "Bsus4", "Bsus2", "Bdim", "Baug",
];
