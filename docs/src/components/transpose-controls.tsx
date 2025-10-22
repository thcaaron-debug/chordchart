import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TransposeControlsProps {
  currentKey: string;
  preferFlats: boolean;
  onTransposeUp: () => void;
  onTransposeDown: () => void;
  onToggleFlats: (checked: boolean) => void;
}

export function TransposeControls({
  currentKey,
  preferFlats,
  onTransposeUp,
  onTransposeDown,
  onToggleFlats,
}: TransposeControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Key:</span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onTransposeDown}
            data-testid="button-transpose-down"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <Badge variant="secondary" className="min-w-12 justify-center font-mono text-base">
            {currentKey}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={onTransposeUp}
            data-testid="button-transpose-up"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 border-l pl-4">
        <Label htmlFor="prefer-flats" className="text-sm font-medium cursor-pointer">
          Use ♭ (flats)
        </Label>
        <Switch
          id="prefer-flats"
          checked={preferFlats}
          onCheckedChange={onToggleFlats}
          data-testid="switch-prefer-flats"
        />
      </div>
    </div>
  );
}
