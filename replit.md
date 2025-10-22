# Chord Chart Library

## Overview

A web-based chord chart management application for musicians. The application allows users to create, edit, organize, and transpose song chord charts with an intuitive interface. Built with a focus on clarity, efficiency, and distraction-free editing workflows inspired by Linear and Notion's productivity aesthetics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tools**
- **React** with TypeScript for type-safe component development
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing (alternative to React Router)

**UI Component System**
- **shadcn/ui** component library using Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- **New York** style variant of shadcn/ui components
- Custom theme system supporting dark/light modes with Material Design + Linear-inspired aesthetics

**State Management & Data Fetching**
- **TanStack Query (React Query)** for server state management, caching, and API interactions
- Local state with React hooks for UI-specific state
- Custom query client configuration with infinite stale time and disabled automatic refetching

**Key Design Patterns**
- Component composition using Radix UI's unstyled primitives wrapped with Tailwind styles
- Separation of presentation components (`/components`) from page-level components (`/pages`)
- Custom hooks for reusable logic (theme management, mobile detection, toast notifications)
- Path aliases (`@/`, `@shared/`) for cleaner imports

### Backend Architecture

**Server Framework**
- **Express.js** running on Node.js with TypeScript
- RESTful API design pattern
- Middleware-based request processing

**API Structure**
- `/api/songs` - GET all songs
- `/api/songs/:id` - GET single song
- `/api/songs` - POST create new song
- `/api/songs/:id` - PATCH update song
- `/api/songs/:id` - DELETE song
- `/api/folders` - GET all folders
- `/api/folders/:id` - GET single folder
- `/api/folders` - POST create new folder
- `/api/folders/:id` - PATCH update folder
- `/api/folders/:id` - DELETE folder (songs moved to uncategorized)

**Data Validation**
- **Zod** schemas for runtime type validation
- Integration with Drizzle ORM through `drizzle-zod` for schema generation
- Validation at API boundaries before database operations

**Development Features**
- Custom logging middleware for API requests with duration tracking
- Vite integration in development mode for HMR (Hot Module Replacement)
- Static file serving in production
- Error handling middleware with standardized error responses

### Data Storage

**Database**
- **PostgreSQL** as the primary database (configured via Drizzle)
- **Neon Database** serverless driver (`@neondatabase/serverless`) for database connectivity
- **Drizzle ORM** for type-safe database queries and migrations

**Schema Design**
The application uses two main tables:

**Folders Table**:
- `id` (varchar, primary key, auto-generated UUID)
- `name` (text, required) - folder name for organizing songs

**Songs Table**:
- `id` (varchar, primary key, auto-generated UUID)
- `title` (text, required)
- `artist` (text, defaults to empty string)
- `originalKey` (text, defaults to "C")
- `currentKey` (text, defaults to "C")
- `folderId` (varchar, nullable) - optional reference to folder for organization
- `sections` (jsonb array) - stores structured chord chart data

**Section Data Structure** (stored in JSONB):
- Each section contains: type (verse, chorus, bridge, etc.), optional label, and array of lines
- Each line contains: lyric text and array of chord placements
- Each chord placement contains: position (character index) and chord name

**Storage Abstraction**
- `IStorage` interface defines all database operations
- `MemStorage` class provides in-memory implementation for development/testing
- Allows easy swapping between in-memory and database-backed storage

### Architectural Decisions

**Monorepo Structure**
- `/client` - Frontend React application
- `/server` - Express backend
- `/shared` - Shared TypeScript types and schemas (used by both client and server)
- Enables type sharing and single build/deploy pipeline

**Why This Stack**
- **Drizzle ORM**: Type-safe, lightweight alternative to Prisma with better PostgreSQL support
- **shadcn/ui over component libraries**: Full customization control while maintaining accessibility through Radix UI
- **TanStack Query**: Eliminates need for Redux/Context API for server state, built-in caching and optimistic updates
- **Wouter over React Router**: Significantly smaller bundle size (~1.2KB vs ~9KB) for simple routing needs

**Chord Display System**
- Two-line input/display: separate lines for chords and lyrics
- Position-based spacing: uses character positions to align chords with lyrics
- Monospace font (`font-mono`) ensures consistent alignment across edit and view modes
- `whitespace-pre` CSS preserves all spacing exactly as entered
- Chords are parsed from space-separated strings and stored with position metadata

**Transposition Logic**
- Client-side chord transposition using music theory algorithms
- Chromatic scale arrays for sharp and flat notation preferences
- Key distance calculation for transposition intervals
- Pattern matching to separate chord root from suffix (e.g., "Am7" → "A" + "m7")
- Spacing preservation: chord positions remain intact during transposition

**Folder Organization**
- Songs can be organized into folders for better library management
- Folders support create, rename, and delete operations
- Songs can be moved between folders or removed to "Uncategorized"
- When a folder is deleted, all songs are automatically moved to uncategorized
- Sidebar displays folders with song counts and hierarchical grouping

**Design System Rationale**
- Dark mode as primary theme (preferred by musicians in low-light environments)
- Monospace fonts for both chords and lyrics to ensure alignment
- Color-coded section badges for quick visual identification
- Material Design elevation patterns for depth and hierarchy

## External Dependencies

### Core Framework Dependencies
- **React 18** - UI framework
- **Express** - HTTP server framework
- **TypeScript** - Type safety across entire stack
- **Vite** - Build tool and dev server

### Database & ORM
- **@neondatabase/serverless** - Serverless PostgreSQL driver for Neon Database
- **drizzle-orm** - TypeScript ORM for database operations
- **drizzle-kit** - CLI tool for migrations and schema management
- **drizzle-zod** - Integration between Drizzle schemas and Zod validation

### UI Component Libraries
- **@radix-ui/react-*** - 20+ unstyled, accessible UI primitives (accordion, dialog, dropdown, select, etc.)
- **shadcn/ui** - Pre-styled wrapper components around Radix UI
- **lucide-react** - Icon library
- **cmdk** - Command palette component

### Styling
- **tailwindcss** - Utility-first CSS framework
- **class-variance-authority** - Variant management for Tailwind components
- **tailwind-merge** - Utility for merging Tailwind class strings
- **clsx** - Utility for conditional class names

### State Management & Forms
- **@tanstack/react-query** - Async state management and caching
- **react-hook-form** - Form state management
- **@hookform/resolvers** - Integration between react-hook-form and validation libraries
- **zod** - Schema validation library

### Routing & Navigation
- **wouter** - Lightweight routing library for React

### Additional UI Libraries
- **embla-carousel-react** - Carousel/slider component
- **date-fns** - Date utility library
- **vaul** - Drawer component library

### Development Tools
- **@replit/vite-plugin-*** - Replit-specific development plugins for enhanced DX
- **esbuild** - JavaScript bundler for production server build

### Session Management
- **connect-pg-simple** - PostgreSQL session store for Express sessions