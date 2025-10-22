import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Save, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import type { Song, Section } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { TransposeControls } from "@/components/transpose-controls";
import { SectionEditor } from "@/components/section-editor";
import { SongMetadataEditor } from "@/components/song-metadata-editor";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/use-toast";
import { transposeChord, getKeyDistance, transposeNote } from "@/lib/chord-utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

export default function ChordEditor() {
  const { id } = useParams<{ id?: string }>();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const isNewSong = location === "/new" || id === "new";

  const [isEditing, setIsEditing] = useState(isNewSong);
  const [preferFlats, setPreferFlats] = useState(false);
  const [columns, setColumns] = useState<1 | 2>(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [sectionPages, setSectionPages] = useState<number[][]>([[]]); // Array of arrays of section indices per page
  const [measureTrigger, setMeasureTrigger] = useState(0); // Used to trigger re-measurement
  
  // Local state for editing
  const [localSong, setLocalSong] = useState<Song | null>(null);
  
  // Ref for measuring content height
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-detect columns based on window width (view mode only)
  useEffect(() => {
    if (isEditing) return; // Edit mode always uses 1 column
    
    const updateColumns = () => {
      setColumns(window.innerWidth >= 768 ? 2 : 1);
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [isEditing]);

  // Responsive pagination: adjust sections per page based on viewport height
  useEffect(() => {
    if (isEditing || !localSong) return;
    
    // Calculate available viewport height for content
    const availableHeight = window.innerHeight - 250; // Header + controls + padding
    
    // Conservative estimate: fewer sections to prevent clipping
    // Average section height varies, so we use a larger estimate to be safe
    const avgSectionHeight = columns === 2 ? 100 : 150; // Shorter in 2-column mode
    const baseSectionsPerPage = Math.floor(availableHeight / avgSectionHeight);
    const sectionsPerPage = Math.max(2, Math.min(baseSectionsPerPage, 8)); // Min 2, max 8
    
    // Create pages with calculated section count
    const pages: number[][] = [];
    for (let i = 0; i < localSong.sections.length; i += sectionsPerPage) {
      const pageIndices = [];
      for (let j = i; j < Math.min(i + sectionsPerPage, localSong.sections.length); j++) {
        pageIndices.push(j);
      }
      pages.push(pageIndices);
    }
    
    setSectionPages(pages.length > 0 ? pages : [Array.from({ length: localSong.sections.length }, (_, i) => i)]);
    
    // Reset to page 1 if current page is beyond new page count
    if (currentPage > pages.length && pages.length > 0) {
      setCurrentPage(1);
    }
  }, [localSong, isEditing, columns, measureTrigger]);
  
  // Recalculate pagination on window resize (any dimension)
  useEffect(() => {
    if (isEditing) return;
    
    const handleResize = () => {
      setMeasureTrigger(prev => prev + 1); // Trigger recalculation
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isEditing]);

  const { data: song, isLoading } = useQuery<Song>({
    queryKey: ["/api/songs", id],
    enabled: !isNewSong,
  });

  const saveMutation = useMutation({
    mutationFn: async (songData: Song) => {
      const response = isNewSong
        ? await apiRequest("POST", "/api/songs", songData)
        : await apiRequest("PATCH", `/api/songs/${id}`, songData);
      return await response.json() as Song;
    },
    onSuccess: (data: Song) => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/songs", id] });
      toast({
        title: "Saved",
        description: "Your song has been saved successfully.",
      });
      if (isNewSong && data?.id) {
        navigate(`/song/${data.id}`);
      } else {
        setIsEditing(false);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save song. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/songs/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      toast({
        title: "Deleted",
        description: "Song has been deleted.",
      });
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete song.",
        variant: "destructive",
      });
    },
  });

  // Initialize local state
  useEffect(() => {
    if (isNewSong) {
      setLocalSong({
        id: "",
        title: "",
        artist: "",
        originalKey: "C",
        currentKey: "C",
        timeSignature: "4/4",
        folderId: null,
        sections: [],
      });
      setIsEditing(true);
    } else if (song) {
      setLocalSong(song);
    }
  }, [song, isNewSong]);

  // Keyboard navigation for page turns (view mode only)
  useEffect(() => {
    if (isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        handlePrevPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, currentPage, localSong]);

  // Reset to page 1 when sections change or switching to view mode
  useEffect(() => {
    if (!isEditing) {
      setCurrentPage(1);
    }
  }, [isEditing, localSong?.sections.length]);

  if (isLoading || !localSong) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const handleSave = () => {
    if (!localSong.title) {
      toast({
        title: "Title required",
        description: "Please enter a song title before saving.",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(localSong);
  };

  const handleTranspose = (semitones: number) => {
    if (!localSong) return;

    const newKey = transposeNote(localSong.currentKey, semitones, preferFlats);
    const newSections = localSong.sections.map((section) => ({
      ...section,
      lines: section.lines.map((line) => ({
        ...line,
        chords: line.chords.map((chord) => ({
          ...chord,
          name: transposeChord(chord.name, semitones, preferFlats),
        })),
      })),
    }));

    setLocalSong({
      ...localSong,
      currentKey: newKey,
      sections: newSections,
    });
  };

  const handleToggleFlats = (checked: boolean) => {
    setPreferFlats(checked);
    if (!localSong) return;

    // Convert current key to preferred notation without changing pitch
    const convertedKey = transposeNote(localSong.currentKey, 0, checked);
    
    // Convert all existing chords to preferred notation
    const newSections = localSong.sections.map((section) => ({
      ...section,
      lines: section.lines.map((line) => ({
        ...line,
        chords: line.chords.map((chord) => ({
          ...chord,
          name: transposeChord(chord.name, 0, checked),
        })),
      })),
    }));

    setLocalSong({
      ...localSong,
      currentKey: convertedKey,
      sections: newSections,
    });
  };

  const handleAddSection = () => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      type: "verse",
      lines: [{ text: "", chords: [], remarks: "" }],
    };
    setLocalSong({
      ...localSong!,
      sections: [...localSong!.sections, newSection],
    });
  };

  const handleUpdateSection = (index: number, section: Section) => {
    const newSections = [...localSong!.sections];
    newSections[index] = section;
    setLocalSong({ ...localSong!, sections: newSections });
  };

  const handleDeleteSection = (index: number) => {
    const newSections = localSong!.sections.filter((_, i) => i !== index);
    setLocalSong({ ...localSong!, sections: newSections });
  };

  const handleCopySection = (index: number) => {
    const sectionToCopy = localSong!.sections[index];
    const copiedSection: Section = {
      ...sectionToCopy,
      id: crypto.randomUUID(),
    };
    const newSections = [...localSong!.sections];
    newSections.splice(index + 1, 0, copiedSection);
    setLocalSong({ ...localSong!, sections: newSections });
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= localSong!.sections.length) return;
    
    const newSections = [...localSong!.sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;
    
    setLocalSong({ ...localSong!, sections: newSections });
  };

  const handleNextPage = () => {
    if (currentPage < sectionPages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Get visible sections for current page
  const totalPages = sectionPages.length;
  const currentPageIndices = sectionPages[currentPage - 1] || [];
  const visibleSections = isEditing 
    ? localSong!.sections 
    : currentPageIndices.map(index => localSong!.sections[index]);

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className={isEditing ? "max-w-4xl mx-auto p-6 space-y-6 overflow-y-auto flex-1" : "w-full p-6 space-y-6 flex-1 overflow-hidden pb-24"}>
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TransposeControls
            currentKey={localSong.currentKey}
            preferFlats={preferFlats}
            onTransposeUp={() => handleTranspose(1)}
            onTransposeDown={() => handleTranspose(-1)}
            onToggleFlats={handleToggleFlats}
          />
          <div className="flex items-center gap-2">
            {!isNewSong && !isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                data-testid="button-edit"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {!isNewSong && isEditing && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setLocalSong(song!);
                }}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
            )}
            {isEditing && (
              <>
                {!isNewSong && (
                  <Button
                    variant="destructive"
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    data-testid="button-delete"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  data-testid="button-save"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Song Metadata */}
        <SongMetadataEditor
          title={localSong.title}
          artist={localSong.artist}
          originalKey={localSong.originalKey}
          currentKey={localSong.currentKey}
          timeSignature={localSong.timeSignature}
          isEditing={isEditing}
          onTitleChange={(title) => setLocalSong({ ...localSong, title })}
          onArtistChange={(artist) => setLocalSong({ ...localSong, artist })}
          onOriginalKeyChange={(originalKey) => {
            const distance = getKeyDistance(localSong.originalKey, originalKey);
            const newCurrentKey = transposeNote(localSong.currentKey, distance, preferFlats);
            setLocalSong({ ...localSong, originalKey, currentKey: newCurrentKey });
          }}
          onTimeSignatureChange={(timeSignature) => setLocalSong({ ...localSong, timeSignature })}
        />

        {/* Sections */}
        {localSong.sections.length === 0 ? (
          <EmptyState
            title="No sections yet"
            description="Add your first section to start building your chord chart."
            actionLabel={isEditing ? "Add Section" : undefined}
            onAction={isEditing ? handleAddSection : undefined}
          />
        ) : (
          <>
            <div>
              {/* Edit mode: single column with Card boxes */}
              {isEditing ? (
                <div className="space-y-4">
                  {visibleSections.map((section, index) => (
                    <SectionEditor
                      key={section.id}
                      section={section}
                      isEditing={isEditing}
                      isFirstSection={index === 0}
                      isLastSection={index === localSong!.sections.length - 1}
                      onUpdateSection={(updated) => handleUpdateSection(index, updated)}
                      onDeleteSection={() => handleDeleteSection(index)}
                      onCopySection={() => handleCopySection(index)}
                      onMoveUp={() => handleMoveSection(index, 'up')}
                      onMoveDown={() => handleMoveSection(index, 'down')}
                    />
                  ))}
                </div>
              ) : (
                /* View mode: CSS multi-column layout (newspaper style) with gesture navigation */
                <div 
                  ref={contentRef} 
                  className={`${columns === 1 ? "columns-1" : "md:columns-2"} gap-6 cursor-pointer`}
                  onClick={(e) => {
                    // Get click position relative to viewport
                    const clickX = e.clientX;
                    const viewportWidth = window.innerWidth;
                    
                    // Left half: go to previous page
                    if (clickX < viewportWidth / 2) {
                      if (currentPage > 1) {
                        handlePrevPage();
                      }
                    } 
                    // Right half: go to next page
                    else {
                      if (currentPage < totalPages) {
                        handleNextPage();
                      }
                    }
                  }}
                  data-testid="view-mode-gesture-area"
                >
                  {visibleSections.map((section, index) => {
                    const actualIndex = currentPageIndices[index];
                    return (
                      <SectionEditor
                        key={section.id}
                        section={section}
                        isEditing={false}
                        isFirstSection={actualIndex === 0}
                        isLastSection={actualIndex === localSong!.sections.length - 1}
                        onUpdateSection={(updated) => handleUpdateSection(actualIndex, updated)}
                        onDeleteSection={() => handleDeleteSection(actualIndex)}
                        onCopySection={() => handleCopySection(actualIndex)}
                        onMoveUp={() => handleMoveSection(actualIndex, 'up')}
                        onMoveDown={() => handleMoveSection(actualIndex, 'down')}
                      />
                    );
                  })}
                </div>
              )}
              
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={handleAddSection}
                  className="w-full mt-4"
                  data-testid="button-add-section"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              )}
            </div>

          </>
        )}
      </div>

      {/* Page Turn Controls - Fixed at bottom in view mode */}
      {!isEditing && localSong.sections.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              data-testid="button-prev-page"
              className="min-w-[120px]"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Previous
            </Button>
            <Badge variant="outline" className="text-base px-4 py-2">
              Page {currentPage} of {totalPages}
            </Badge>
            <Button
              variant="outline"
              size="lg"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              data-testid="button-next-page"
              className="min-w-[120px]"
            >
              Next
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
