import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SongMetadataEditorProps {
  title: string;
  artist: string;
  originalKey: string;
  currentKey: string;
  timeSignature: string | null;
  isEditing: boolean;
  onTitleChange: (title: string) => void;
  onArtistChange: (artist: string) => void;
  onOriginalKeyChange: (key: string) => void;
  onTimeSignatureChange: (timeSignature: string) => void;
}

const KEYS = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"];
const COMMON_TIME_SIGNATURES = ["4/4", "3/4", "6/8", "2/4", "5/4", "7/8", "9/8", "12/8", "custom"];

export function SongMetadataEditor({
  title,
  artist,
  originalKey,
  currentKey,
  timeSignature,
  isEditing,
  onTitleChange,
  onArtistChange,
  onOriginalKeyChange,
  onTimeSignatureChange,
}: SongMetadataEditorProps) {
  const isTransposed = originalKey !== currentKey;
  const [isCustomTime, setIsCustomTime] = useState(false);
  const isCommonTimeSignature = COMMON_TIME_SIGNATURES.slice(0, -1).includes(timeSignature || "4/4");

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Song Title"
                  className="text-2xl font-semibold h-auto py-2"
                  data-testid="input-song-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist" className="text-sm font-medium">
                  Artist
                </Label>
                <Input
                  id="artist"
                  value={artist}
                  onChange={(e) => onArtistChange(e.target.value)}
                  placeholder="Artist Name"
                  data-testid="input-song-artist"
                />
              </div>
              <div className="flex gap-4">
                <div className="space-y-2">
                  <Label htmlFor="original-key" className="text-sm font-medium">
                    Original Key
                  </Label>
                  <Select value={originalKey} onValueChange={onOriginalKeyChange}>
                    <SelectTrigger id="original-key" className="w-32" data-testid="select-original-key">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {KEYS.map((key) => (
                        <SelectItem key={key} value={key}>
                          {key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-signature" className="text-sm font-medium">
                    Time Signature
                  </Label>
                  {isCustomTime ? (
                    <Input
                      id="time-signature-custom"
                      value={timeSignature || "4/4"}
                      onChange={(e) => onTimeSignatureChange(e.target.value)}
                      placeholder="e.g., 7/4"
                      className="w-32"
                      data-testid="input-time-signature-custom"
                      onBlur={() => {
                        if (COMMON_TIME_SIGNATURES.slice(0, -1).includes(timeSignature || "")) {
                          setIsCustomTime(false);
                        }
                      }}
                    />
                  ) : (
                    <Select
                      value={isCommonTimeSignature ? (timeSignature || "4/4") : "custom"}
                      onValueChange={(value) => {
                        if (value === "custom") {
                          setIsCustomTime(true);
                        } else {
                          onTimeSignatureChange(value);
                        }
                      }}
                    >
                      <SelectTrigger id="time-signature" className="w-32" data-testid="select-time-signature">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMON_TIME_SIGNATURES.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time === "custom" ? "Custom..." : time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold" data-testid="text-song-title">
                {title || "Untitled Song"}
              </h1>
              <p className="text-lg text-muted-foreground" data-testid="text-song-artist">
                {artist || "Unknown Artist"}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Original Key: </span>
                  <span className="font-mono font-medium" data-testid="text-original-key">
                    {originalKey}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Time: </span>
                  <span className="font-mono font-medium" data-testid="text-time-signature">
                    {timeSignature || "4/4"}
                  </span>
                </div>
                {isTransposed && (
                  <div className="text-chart-3">
                    <span className="text-muted-foreground">Transposed to: </span>
                    <span className="font-mono font-medium" data-testid="text-current-key">
                      {currentKey}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
