import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSongSchema, insertFolderSchema, insertPlaylistSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all songs
  app.get("/api/songs", async (_req, res) => {
    try {
      const songs = await storage.getAllSongs();
      res.json(songs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch songs" });
    }
  });

  // Get a single song
  app.get("/api/songs/:id", async (req, res) => {
    try {
      const song = await storage.getSong(req.params.id);
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }
      res.json(song);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch song" });
    }
  });

  // Create a new song
  app.post("/api/songs", async (req, res) => {
    try {
      const validatedData = insertSongSchema.parse(req.body);
      const song = await storage.createSong(validatedData);
      res.status(201).json(song);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create song" });
      }
    }
  });

  // Update a song
  app.patch("/api/songs/:id", async (req, res) => {
    try {
      const validatedData = insertSongSchema.partial().parse(req.body);
      const song = await storage.updateSong(req.params.id, validatedData);
      if (!song) {
        return res.status(404).json({ error: "Song not found" });
      }
      res.json(song);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to update song" });
      }
    }
  });

  // Delete a song
  app.delete("/api/songs/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSong(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Song not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete song" });
    }
  });

  // Get all folders
  app.get("/api/folders", async (_req, res) => {
    try {
      const folders = await storage.getAllFolders();
      res.json(folders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch folders" });
    }
  });

  // Get a single folder
  app.get("/api/folders/:id", async (req, res) => {
    try {
      const folder = await storage.getFolder(req.params.id);
      if (!folder) {
        return res.status(404).json({ error: "Folder not found" });
      }
      res.json(folder);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch folder" });
    }
  });

  // Create a new folder
  app.post("/api/folders", async (req, res) => {
    try {
      const validatedData = insertFolderSchema.parse(req.body);
      const folder = await storage.createFolder(validatedData);
      res.status(201).json(folder);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create folder" });
      }
    }
  });

  // Update a folder
  app.patch("/api/folders/:id", async (req, res) => {
    try {
      const validatedData = insertFolderSchema.partial().parse(req.body);
      const folder = await storage.updateFolder(req.params.id, validatedData);
      if (!folder) {
        return res.status(404).json({ error: "Folder not found" });
      }
      res.json(folder);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to update folder" });
      }
    }
  });

  // Delete a folder
  app.delete("/api/folders/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFolder(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Folder not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete folder" });
    }
  });

  // Get all playlists
  app.get("/api/playlists", async (_req, res) => {
    try {
      const playlists = await storage.getAllPlaylists();
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch playlists" });
    }
  });

  // Get a single playlist
  app.get("/api/playlists/:id", async (req, res) => {
    try {
      const playlist = await storage.getPlaylist(req.params.id);
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      res.json(playlist);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch playlist" });
    }
  });

  // Create a new playlist
  app.post("/api/playlists", async (req, res) => {
    try {
      const validatedData = insertPlaylistSchema.parse(req.body);
      const playlist = await storage.createPlaylist(validatedData);
      res.status(201).json(playlist);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create playlist" });
      }
    }
  });

  // Update a playlist
  app.patch("/api/playlists/:id", async (req, res) => {
    try {
      const validatedData = insertPlaylistSchema.partial().parse(req.body);
      const playlist = await storage.updatePlaylist(req.params.id, validatedData);
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      res.json(playlist);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to update playlist" });
      }
    }
  });

  // Delete a playlist
  app.delete("/api/playlists/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePlaylist(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete playlist" });
    }
  });

  // Add song to playlist
  app.post("/api/playlists/:id/songs", async (req, res) => {
    try {
      const { songId } = req.body;
      if (!songId) {
        return res.status(400).json({ error: "songId is required" });
      }
      const playlist = await storage.addSongToPlaylist(req.params.id, songId);
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      res.json(playlist);
    } catch (error) {
      res.status(500).json({ error: "Failed to add song to playlist" });
    }
  });

  // Remove song from playlist
  app.delete("/api/playlists/:id/songs/:songId", async (req, res) => {
    try {
      const playlist = await storage.removeSongFromPlaylist(req.params.id, req.params.songId);
      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }
      res.json(playlist);
    } catch (error) {
      res.status(500).json({ error: "Failed to remove song from playlist" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
