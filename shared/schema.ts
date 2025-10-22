import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Chord placement in a line
export const chordSchema = z.object({
  position: z.number(), // Character position in the lyric line
  name: z.string(), // Chord name (e.g., "C", "Am7", "G/B")
});

// Line with lyrics and chords
export const lineSchema = z.object({
  text: z.string(), // Lyric text
  chords: z.array(chordSchema), // Chords positioned above this line
  remarks: z.string().optional(), // Special remarks above chords (invisible when empty)
});

// Section types
export const sectionTypeSchema = z.enum([
  "verse",
  "chorus",
  "bridge",
  "pre-chorus",
  "intro",
  "outro",
  "instrumental",
]);

// Song section
export const sectionSchema = z.object({
  id: z.string(),
  type: sectionTypeSchema,
  label: z.string().optional(), // e.g., "Verse 1", "Chorus"
  lines: z.array(lineSchema),
});

// Folders table
export const folders = pgTable("folders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
});

// Songs table
export const songs = pgTable("songs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artist: text("artist").notNull().default(""),
  originalKey: text("original_key").notNull().default("C"),
  currentKey: text("current_key").notNull().default("C"),
  timeSignature: text("time_signature").default("4/4"),
  folderId: varchar("folder_id"),
  sections: jsonb("sections").$type<z.infer<typeof sectionSchema>[]>().notNull().default([]),
});

export const insertSongSchema = createInsertSchema(songs).omit({
  id: true,
});

export const insertFolderSchema = createInsertSchema(folders).omit({
  id: true,
});

// Playlists table
export const playlists = pgTable("playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  songIds: jsonb("song_ids").$type<string[]>().notNull().default([]),
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
});

export type InsertSong = z.infer<typeof insertSongSchema>;
export type Song = typeof songs.$inferSelect;
export type Folder = typeof folders.$inferSelect;
export type InsertFolder = z.infer<typeof insertFolderSchema>;
export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Chord = z.infer<typeof chordSchema>;
export type Line = z.infer<typeof lineSchema>;
export type Section = z.infer<typeof sectionSchema>;
export type SectionType = z.infer<typeof sectionTypeSchema>;
