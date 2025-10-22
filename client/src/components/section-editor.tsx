import { Plus, Trash2, GripVertical, Copy, ChevronUp, ChevronDown } from "lucide-react";
import type { Section, Line, SectionType, Chord } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChordLine } from "./chord-line";
import { SectionBadge } from "./section-badge";

interface SectionEditorProps {
  section: Section;
  isEditing: boolean;
  isFirstSection?: boolean;
  isLastSection?: boolean;
  onUpdateSection: (section: Section) => void;
  onDeleteSection: () => void;
  onCopySection?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const SECTION_TYPES: SectionType[] = [
  "verse",
  "chorus",
  "bridge",
  "pre-chorus",
  "intro",
  "outro",
  "instrumental",
];

export function SectionEditor({
  section,
  isEditing,
  isFirstSection = false,
  isLastSection = false,
  onUpdateSection,
  onDeleteSection,
  onCopySection,
  onMoveUp,
  onMoveDown,
}: SectionEditorProps) {
  const handleTypeChange = (type: SectionType) => {
    onUpdateSection({ ...section, type });
  };

  const handleLabelChange = (label: string) => {
    onUpdateSection({ ...section, label });
  };

  const handleAddLine = () => {
    onUpdateSection({
      ...section,
      lines: [...section.lines, { text: "", chords: [], remarks: "" }],
    });
  };

  const handleUpdateLine = (index: number, line: Line) => {
    const newLines = [...section.lines];
    newLines[index] = line;
    onUpdateSection({ ...section, lines: newLines });
  };

  const handleDeleteLine = (index: number) => {
    const newLines = section.lines.filter((_, i) => i !== index);
    onUpdateSection({ ...section, lines: newLines });
  };

  const handleChordChange = (lineIndex: number, chords: Chord[]) => {
    const line = section.lines[lineIndex];
    handleUpdateLine(lineIndex, { ...line, chords });
  };

  const handleLyricsChange = (lineIndex: number, text: string) => {
    const line = section.lines[lineIndex];
    handleUpdateLine(lineIndex, { ...line, text });
  };

  const handleRemarksChange = (lineIndex: number, remarks: string) => {
    const line = section.lines[lineIndex];
    handleUpdateLine(lineIndex, { ...line, remarks });
  };

  // In view mode, render without Card wrapper for CSS column flow
  if (!isEditing) {
    return (
      <div data-testid={`section-${section.id}`} className="mb-6">
        <div className="mb-2">
          <SectionBadge type={section.type} label={section.label} />
        </div>
        <div className="space-y-2">
          {section.lines.map((line, index) => (
            <div key={index}>
              <ChordLine
                line={line}
                isEditing={false}
                onChordChange={() => {}}
                onLyricsChange={() => {}}
                onRemarksChange={() => {}}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Edit mode: render with Card wrapper
  return (
    <Card data-testid={`section-${section.id}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <div className="flex items-center gap-2 flex-1">
              <Select value={section.type} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-40" data-testid="select-section-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={section.label || ""}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="Label (optional)"
                className="max-w-48"
                data-testid="input-section-label"
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopySection}
              data-testid="button-copy-section"
              title="Copy section"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveUp}
              disabled={isFirstSection}
              data-testid="button-move-up"
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMoveDown}
              disabled={isLastSection}
              data-testid="button-move-down"
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteSection}
              data-testid="button-delete-section"
              title="Delete section"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {section.lines.map((line, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1">
              <ChordLine
                line={line}
                isEditing={isEditing}
                onChordChange={(chords) => handleChordChange(index, chords)}
                onLyricsChange={(text) => handleLyricsChange(index, text)}
                onRemarksChange={(remarks) => handleRemarksChange(index, remarks)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleDeleteLine(index)}
              data-testid={`button-delete-line-${index}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddLine}
          className="mt-2"
          data-testid="button-add-line"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Line
        </Button>
      </CardContent>
    </Card>
  );
}
