import { Music, Plus, Search, Folder, MoreVertical, Edit, Trash2, FolderPlus, ListMusic } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Song, Folder as FolderType, Playlist } from "@shared/schema";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function AppSidebar() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<FolderType | null>(null);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [deletingPlaylist, setDeletingPlaylist] = useState<Playlist | null>(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data: songs, isLoading: songsLoading } = useQuery<Song[]>({
    queryKey: ["/api/songs"],
  });

  const { data: folders, isLoading: foldersLoading } = useQuery<FolderType[]>({
    queryKey: ["/api/folders"],
  });

  const { data: playlists, isLoading: playlistsLoading } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });

  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/folders", { name });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      setIsCreateFolderOpen(false);
      setFolderName("");
      toast({ title: "Folder created" });
    },
  });

  const updateFolderMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await apiRequest("PATCH", `/api/folders/${id}`, { name });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      setEditingFolder(null);
      setFolderName("");
      toast({ title: "Folder renamed" });
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/folders/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      setDeletingFolder(null);
      toast({ title: "Folder deleted" });
    },
  });

  const moveSongMutation = useMutation({
    mutationFn: async ({ songId, folderId }: { songId: string; folderId: string | null }) => {
      const response = await apiRequest("PATCH", `/api/songs/${songId}`, { folderId });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/songs"] });
      toast({ title: "Song moved" });
    },
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/playlists", { name });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      setIsCreatePlaylistOpen(false);
      setPlaylistName("");
      toast({ title: "Playlist created" });
    },
  });

  const updatePlaylistMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await apiRequest("PATCH", `/api/playlists/${id}`, { name });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      setEditingPlaylist(null);
      setPlaylistName("");
      toast({ title: "Playlist renamed" });
    },
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/playlists/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      setDeletingPlaylist(null);
      setSelectedPlaylistId(null);
      toast({ title: "Playlist deleted" });
    },
  });

  const addSongToPlaylistMutation = useMutation({
    mutationFn: async ({ playlistId, songId }: { playlistId: string; songId: string }) => {
      const response = await apiRequest("POST", `/api/playlists/${playlistId}/songs`, { songId });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      toast({ title: "Added to playlist" });
    },
  });

  const removeSongFromPlaylistMutation = useMutation({
    mutationFn: async ({ playlistId, songId }: { playlistId: string; songId: string }) => {
      await apiRequest("DELETE", `/api/playlists/${playlistId}/songs/${songId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      toast({ title: "Removed from playlist" });
    },
  });

  let filteredSongs = songs?.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Filter by selected playlist if any
  if (selectedPlaylistId && playlists) {
    const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);
    if (selectedPlaylist) {
      filteredSongs = filteredSongs.filter(song => selectedPlaylist.songIds.includes(song.id));
    }
  }

  const songsWithoutFolder = filteredSongs.filter(song => !song.folderId);
  const songsByFolder = folders?.map(folder => ({
    folder,
    songs: filteredSongs.filter(song => song.folderId === folder.id),
  })) || [];

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      createFolderMutation.mutate(folderName.trim());
    }
  };

  const handleUpdateFolder = () => {
    if (editingFolder && folderName.trim()) {
      updateFolderMutation.mutate({ id: editingFolder.id, name: folderName.trim() });
    }
  };

  const handleDeleteFolder = () => {
    if (deletingFolder) {
      deleteFolderMutation.mutate(deletingFolder.id);
    }
  };

  const handleCreatePlaylist = () => {
    if (playlistName.trim()) {
      createPlaylistMutation.mutate(playlistName.trim());
    }
  };

  const handleUpdatePlaylist = () => {
    if (editingPlaylist && playlistName.trim()) {
      updatePlaylistMutation.mutate({ id: editingPlaylist.id, name: playlistName.trim() });
    }
  };

  const handleDeletePlaylist = () => {
    if (deletingPlaylist) {
      deletePlaylistMutation.mutate(deletingPlaylist.id);
    }
  };

  const renderSongItem = (song: Song) => {
    // Find which playlists contain this song
    const songPlaylists = playlists?.filter(p => p.songIds.includes(song.id)) || [];
    
    return (
      <SidebarMenuItem key={song.id}>
        <div className="flex items-start gap-1 w-full group">
          <SidebarMenuButton
            asChild
            isActive={location === `/song/${song.id}`}
            data-testid={`link-song-${song.id}`}
            className="flex-1 py-5"
          >
            <Link href={`/song/${song.id}`}>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <span className="font-medium truncate">{song.title}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {song.artist || "Unknown Artist"} • {song.currentKey}{song.timeSignature ? ` • ${song.timeSignature}` : ""}
                </span>
              </div>
            </Link>
          </SidebarMenuButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                data-testid={`button-song-menu-${song.id}`}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* Folder operations */}
              {folders && folders.length > 0 && (
                <>
                  <DropdownMenuItem
                    onClick={() => moveSongMutation.mutate({ songId: song.id, folderId: null })}
                  >
                    Remove from folder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {folders.map(folder => (
                    <DropdownMenuItem
                      key={folder.id}
                      onClick={() => moveSongMutation.mutate({ songId: song.id, folderId: folder.id })}
                    >
                      Move to {folder.name}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              
              {/* Playlist operations */}
              {playlists && playlists.length > 0 && (
                <>
                  {folders && folders.length > 0 && <DropdownMenuSeparator />}
                  {playlists.map(playlist => {
                    const isInPlaylist = playlist.songIds.includes(song.id);
                    return (
                      <DropdownMenuItem
                        key={playlist.id}
                        onClick={() => {
                          if (isInPlaylist) {
                            removeSongFromPlaylistMutation.mutate({ playlistId: playlist.id, songId: song.id });
                          } else {
                            addSongToPlaylistMutation.mutate({ playlistId: playlist.id, songId: song.id });
                          }
                        }}
                        data-testid={`button-add-to-playlist-${song.id}`}
                      >
                        {isInPlaylist ? `Remove from ${playlist.name}` : `Add to ${playlist.name}`}
                      </DropdownMenuItem>
                    );
                  })}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2 mb-4">
          <Music className="h-6 w-6 text-primary" />
          <h1 className="font-semibold text-lg">Chord Charts</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search songs..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-songs"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-3 py-2">
            <SidebarGroupLabel>Library</SidebarGroupLabel>
            <div className="flex gap-1">
              <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" data-testid="button-new-folder">
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Folder</DialogTitle>
                    <DialogDescription>
                      Create a new folder to organize your songs.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    placeholder="Folder name"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                    data-testid="input-folder-name"
                  />
                  <DialogFooter>
                    <Button onClick={handleCreateFolder} data-testid="button-create-folder">
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button size="sm" variant="ghost" asChild data-testid="button-new-song">
                <Link href="/new">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-3">
              {songsLoading || foldersLoading ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : (
                <>
                  {/* Folders with songs */}
                  {songsByFolder.map(({ folder, songs: folderSongs }) => (
                    <div key={folder.id} className="mb-4">
                      <div className="flex items-center justify-between px-3 py-1 group">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm font-medium truncate">{folder.name}</span>
                          <Badge variant="secondary" className="text-xs h-5">
                            {folderSongs.length}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                              data-testid={`button-folder-menu-${folder.id}`}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingFolder(folder);
                                setFolderName(folder.name);
                              }}
                            >
                              <Edit className="h-3 w-3 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingFolder(folder)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="ml-6">
                        {folderSongs.map(renderSongItem)}
                      </div>
                    </div>
                  ))}

                  {/* Songs without folder */}
                  {songsWithoutFolder.length > 0 && (
                    <div>
                      {songsByFolder.length > 0 && (
                        <div className="px-3 py-1 text-sm font-medium text-muted-foreground">
                          Uncategorized
                        </div>
                      )}
                      {songsWithoutFolder.map(renderSongItem)}
                    </div>
                  )}

                  {/* Empty state */}
                  {filteredSongs.length === 0 && (
                    <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                      {searchQuery ? "No songs found" : "No songs yet"}
                    </div>
                  )}
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Playlists Section */}
        <SidebarGroup>
          <div className="flex items-center justify-between px-3 py-2">
            <SidebarGroupLabel>Playlists</SidebarGroupLabel>
            <Dialog open={isCreatePlaylistOpen} onOpenChange={setIsCreatePlaylistOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" data-testid="button-new-playlist">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Playlist</DialogTitle>
                  <DialogDescription>
                    Create a new playlist to organize your songs.
                  </DialogDescription>
                </DialogHeader>
                <Input
                  placeholder="Playlist name"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
                  data-testid="input-playlist-name"
                />
                <DialogFooter>
                  <Button onClick={handleCreatePlaylist} data-testid="button-create-playlist">
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-3">
              {playlistsLoading ? (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : playlists && playlists.length > 0 ? (
                playlists.map(playlist => (
                  <SidebarMenuItem key={playlist.id}>
                    <div className="flex items-center justify-between px-3 py-1 group">
                      <button
                        onClick={() => setSelectedPlaylistId(selectedPlaylistId === playlist.id ? null : playlist.id)}
                        className="flex items-center gap-2 flex-1 min-w-0 hover-elevate active-elevate-2 rounded-md px-2 py-1"
                        data-active={selectedPlaylistId === playlist.id}
                      >
                        <ListMusic className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{playlist.name}</span>
                        <Badge variant="secondary" className="text-xs h-5">
                          {playlist.songIds.length}
                        </Badge>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            data-testid={`button-playlist-menu-${playlist.id}`}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingPlaylist(playlist);
                              setPlaylistName(playlist.name);
                            }}
                          >
                            <Edit className="h-3 w-3 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingPlaylist(playlist)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </SidebarMenuItem>
                ))
              ) : (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  No playlists yet
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Rename Folder Dialog */}
      <Dialog open={editingFolder !== null} onOpenChange={(open) => !open && setEditingFolder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>
              Enter a new name for this folder.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpdateFolder()}
            data-testid="input-rename-folder"
          />
          <DialogFooter>
            <Button onClick={handleUpdateFolder} data-testid="button-rename-folder">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Confirmation */}
      <AlertDialog open={deletingFolder !== null} onOpenChange={(open) => !open && setDeletingFolder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this folder? Songs inside will be moved to uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-folder">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFolder} data-testid="button-confirm-delete-folder">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename Playlist Dialog */}
      <Dialog open={editingPlaylist !== null} onOpenChange={(open) => !open && setEditingPlaylist(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Playlist</DialogTitle>
            <DialogDescription>
              Enter a new name for this playlist.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Playlist name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpdatePlaylist()}
            data-testid="input-rename-playlist"
          />
          <DialogFooter>
            <Button onClick={handleUpdatePlaylist} data-testid="button-rename-playlist">
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Playlist Confirmation */}
      <AlertDialog open={deletingPlaylist !== null} onOpenChange={(open) => !open && setDeletingPlaylist(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this playlist?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-playlist">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlaylist} data-testid="button-confirm-delete-playlist">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
