import { Badge } from "@/components/ui/badge";
import type { SectionType } from "@shared/schema";

const SECTION_COLORS: Record<SectionType, string> = {
  verse: "bg-chart-2 text-foreground",
  chorus: "bg-chart-1 text-foreground",
  bridge: "bg-chart-3 text-foreground",
  "pre-chorus": "bg-chart-4 text-foreground",
  intro: "bg-muted text-muted-foreground",
  outro: "bg-muted text-muted-foreground",
  instrumental: "bg-accent text-accent-foreground",
};

const SECTION_LABELS: Record<SectionType, string> = {
  verse: "Verse",
  chorus: "Chorus",
  bridge: "Bridge",
  "pre-chorus": "Pre-Chorus",
  intro: "Intro",
  outro: "Outro",
  instrumental: "Instrumental",
};

interface SectionBadgeProps {
  type: SectionType;
  label?: string;
}

export function SectionBadge({ type, label }: SectionBadgeProps) {
  const displayLabel = label || SECTION_LABELS[type];
  
  return (
    <Badge
      variant="secondary"
      className={`${SECTION_COLORS[type]} font-medium`}
      data-testid={`badge-section-${type}`}
    >
      {displayLabel}
    </Badge>
  );
}
