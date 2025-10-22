import { type Song, type InsertSong, type Folder, type InsertFolder, type Playlist, type InsertPlaylist } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getSong(id: string): Promise<Song | undefined>;
  getAllSongs(): Promise<Song[]>;
  createSong(song: InsertSong): Promise<Song>;
  updateSong(id: string, song: Partial<InsertSong>): Promise<Song | undefined>;
  deleteSong(id: string): Promise<boolean>;
  
  getFolder(id: string): Promise<Folder | undefined>;
  getAllFolders(): Promise<Folder[]>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: string, folder: Partial<InsertFolder>): Promise<Folder | undefined>;
  deleteFolder(id: string): Promise<boolean>;

  getPlaylist(id: string): Promise<Playlist | undefined>;
  getAllPlaylists(): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: string, playlist: Partial<InsertPlaylist>): Promise<Playlist | undefined>;
  deletePlaylist(id: string): Promise<boolean>;
  addSongToPlaylist(playlistId: string, songId: string): Promise<Playlist | undefined>;
  removeSongFromPlaylist(playlistId: string, songId: string): Promise<Playlist | undefined>;
}

export class MemStorage implements IStorage {
  private songs: Map<string, Song>;
  private folders: Map<string, Folder>;
  private playlists: Map<string, Playlist>;

  constructor() {
    this.songs = new Map();
    this.folders = new Map();
    this.playlists = new Map();
  }

  async getSong(id: string): Promise<Song | undefined> {
    return this.songs.get(id);
  }

  async getAllSongs(): Promise<Song[]> {
    return Array.from(this.songs.values());
  }

  async createSong(insertSong: InsertSong): Promise<Song> {
    const id = randomUUID();
    const song: Song = {
      id,
      title: insertSong.title,
      artist: insertSong.artist || "",
      originalKey: insertSong.originalKey || "C",
      currentKey: insertSong.currentKey || "C",
      timeSignature: insertSong.timeSignature || "4/4",
      folderId: insertSong.folderId || null,
      sections: (insertSong.sections || []) as any,
    };
    this.songs.set(id, song);
    return song;
  }

  async updateSong(id: string, updates: Partial<InsertSong>): Promise<Song | undefined> {
    const song = this.songs.get(id);
    if (!song) return undefined;

    const updatedSong: Song = {
      ...song,
      ...updates,
      artist: updates.artist !== undefined ? updates.artist : song.artist,
      originalKey: updates.originalKey !== undefined ? updates.originalKey : song.originalKey,
      currentKey: updates.currentKey !== undefined ? updates.currentKey : song.currentKey,
      timeSignature: updates.timeSignature !== undefined ? updates.timeSignature : song.timeSignature,
      folderId: updates.folderId !== undefined ? updates.folderId : song.folderId,
      sections: (updates.sections !== undefined ? updates.sections : song.sections) as any,
    };
    this.songs.set(id, updatedSong);
    return updatedSong;
  }

  async deleteSong(id: string): Promise<boolean> {
    // Remove song from all playlists
    const allPlaylists = Array.from(this.playlists.values());
    for (const playlist of allPlaylists) {
      if (playlist.songIds.includes(id)) {
        playlist.songIds = playlist.songIds.filter(songId => songId !== id);
        this.playlists.set(playlist.id, playlist);
      }
    }
    return this.songs.delete(id);
  }

  async getFolder(id: string): Promise<Folder | undefined> {
    return this.folders.get(id);
  }

  async getAllFolders(): Promise<Folder[]> {
    return Array.from(this.folders.values());
  }

  async createFolder(insertFolder: InsertFolder): Promise<Folder> {
    const id = randomUUID();
    const folder: Folder = {
      id,
      name: insertFolder.name,
    };
    this.folders.set(id, folder);
    return folder;
  }

  async updateFolder(id: string, updates: Partial<InsertFolder>): Promise<Folder | undefined> {
    const folder = this.folders.get(id);
    if (!folder) return undefined;

    const updatedFolder: Folder = {
      ...folder,
      ...updates,
    };
    this.folders.set(id, updatedFolder);
    return updatedFolder;
  }

  async deleteFolder(id: string): Promise<boolean> {
    // Remove folder reference from all songs in this folder
    const allSongs = Array.from(this.songs.values());
    for (const song of allSongs) {
      if (song.folderId === id) {
        song.folderId = null;
      }
    }
    return this.folders.delete(id);
  }

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async getAllPlaylists(): Promise<Playlist[]> {
    return Array.from(this.playlists.values());
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = randomUUID();
    const playlist: Playlist = {
      id,
      name: insertPlaylist.name,
      songIds: (insertPlaylist.songIds || []) as any,
    };
    this.playlists.set(id, playlist);
    return playlist;
  }

  async updatePlaylist(id: string, updates: Partial<InsertPlaylist>): Promise<Playlist | undefined> {
    const playlist = this.playlists.get(id);
    if (!playlist) return undefined;

    const updatedPlaylist: Playlist = {
      ...playlist,
      ...updates,
      songIds: (updates.songIds !== undefined ? updates.songIds : playlist.songIds) as any,
    };
    this.playlists.set(id, updatedPlaylist);
    return updatedPlaylist;
  }

  async deletePlaylist(id: string): Promise<boolean> {
    return this.playlists.delete(id);
  }

  async addSongToPlaylist(playlistId: string, songId: string): Promise<Playlist | undefined> {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) return undefined;

    if (!playlist.songIds.includes(songId)) {
      playlist.songIds.push(songId);
      this.playlists.set(playlistId, playlist);
    }
    return playlist;
  }

  async removeSongFromPlaylist(playlistId: string, songId: string): Promise<Playlist | undefined> {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) return undefined;

    playlist.songIds = playlist.songIds.filter(id => id !== songId);
    this.playlists.set(playlistId, playlist);
    return playlist;
  }
}

export const storage = new MemStorage();
