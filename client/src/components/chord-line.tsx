import { useState, useEffect } from "react";
import type { Line, Chord } from "@shared/schema";
import { Input } from "@/components/ui/input";

interface ChordLineProps {
  line: Line;
  isEditing: boolean;
  onChordChange?: (chords: Chord[]) => void;
  onLyricsChange?: (text: string) => void;
  onRemarksChange?: (remarks: string) => void;
}

// Parse chord string preserving positions based on spacing
function parseChordsFromString(chordString: string): Chord[] {
  const chords: Chord[] = [];
  let position = 0;
  let currentChord = "";
  
  for (let i = 0; i < chordString.length; i++) {
    const char = chordString[i];
    
    if (char === ' ') {
      if (currentChord) {
        chords.push({ name: currentChord, position: position - currentChord.length });
        currentChord = "";
      }
      position++;
    } else {
      currentChord += char;
      position++;
    }
  }
  
  // Add last chord if exists
  if (currentChord) {
    chords.push({ name: currentChord, position: position - currentChord.length });
  }
  
  return chords;
}

// Convert chord array to positioned string for editing
function chordsToString(chords: Chord[]): string {
  if (!chords || chords.length === 0) return "";
  
  const sorted = [...chords].sort((a, b) => a.position - b.position);
  let result = "";
  let currentPos = 0;
  
  for (const chord of sorted) {
    // Skip invalid chords
    if (!chord || !chord.name || typeof chord.name !== 'string') continue;
    
    // Add spaces to reach the chord position
    while (currentPos < chord.position) {
      result += " ";
      currentPos++;
    }
    // Add the chord
    result += chord.name;
    currentPos += chord.name.length;
  }
  
  return result;
}

export function ChordLine({
  line,
  isEditing,
  onChordChange,
  onLyricsChange,
  onRemarksChange,
}: ChordLineProps) {
  // Use local state to track the raw input string while editing
  const [localChordString, setLocalChordString] = useState("");
  const [wasEditing, setWasEditing] = useState(false);

  // Initialize local state from line.chords only when entering edit mode or when the line ID changes
  useEffect(() => {
    // Only update if we're switching to edit mode or if it's a different line
    if (isEditing && !wasEditing) {
      setLocalChordString(chordsToString(line.chords));
    }
    setWasEditing(isEditing);
  }, [isEditing]);

  // Update when the line reference changes (e.g., from transposition)
  useEffect(() => {
    if (!isEditing) {
      setLocalChordString(chordsToString(line.chords));
    }
  }, [line, isEditing]);

  const handleChordInputChange = (value: string) => {
    setLocalChordString(value);
    const parsedChords = parseChordsFromString(value);
    onChordChange?.(parsedChords);
  };

  const displayString = isEditing ? localChordString : chordsToString(line.chords);
  const hasChords = line.chords && line.chords.length > 0;
  const hasText = line.text && line.text.trim().length > 0;
  const hasRemarks = line.remarks && line.remarks.trim().length > 0;
  const hasAnyContent = hasChords || hasText || hasRemarks;

  return (
    <div className="space-y-1 mb-3">
      {/* Remarks line - only visible when has content or when editing */}
      {(isEditing || hasRemarks) && (
        isEditing ? (
          <Input
            value={line.remarks || ""}
            onChange={(e) => onRemarksChange?.(e.target.value)}
            placeholder="Special remarks (optional)"
            className="font-mono text-sm text-muted-foreground border-0 focus-visible:ring-1 px-0 h-auto py-0"
            data-testid="input-remarks"
          />
        ) : hasRemarks ? (
          <div className="font-mono text-sm text-muted-foreground whitespace-pre" data-testid="text-remarks">
            {line.remarks}
          </div>
        ) : null
      )}

      {/* Chord line - hide in view mode if no chords */}
      {(isEditing || hasChords) && (
        isEditing ? (
          <Input
            value={displayString}
            onChange={(e) => handleChordInputChange(e.target.value)}
            placeholder="Enter chords with spacing (e.g., G     C   Am    D)"
            className="font-mono text-base font-medium text-chart-3 border-0 focus-visible:ring-1 px-0 h-auto py-0"
            data-testid="input-chords"
          />
        ) : (
          <div className="font-mono text-base font-medium text-chart-3 whitespace-pre" data-testid="text-chords">
            {displayString}
          </div>
        )
      )}

      {/* Lyrics line - always show in view mode if any content exists, or always in edit mode */}
      {(isEditing || hasText || (!hasAnyContent && !isEditing)) && (
        isEditing ? (
          <Input
            value={line.text}
            onChange={(e) => onLyricsChange?.(e.target.value)}
            placeholder="Enter lyrics..."
            className="font-mono text-base border-0 focus-visible:ring-1 px-0 h-auto py-0"
            data-testid="input-lyrics"
          />
        ) : (
          <div className="font-mono text-base whitespace-pre" data-testid="text-lyrics">
            {hasText ? line.text : "\u00A0"}
          </div>
        )
      )}
    </div>
  );
}
