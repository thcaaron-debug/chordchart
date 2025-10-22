# Chord Chart Library - Design Guidelines

## Design Approach
**System-Based**: Material Design + Linear-inspired productivity aesthetic
**Rationale**: Musicians need efficiency, clarity, and quick access. This utility-focused tool prioritizes readability, fast editing workflows, and distraction-free chord chart display.

**Reference Inspiration**: Linear (clean, purposeful UI), Notion (content organization), MuseScore (music notation clarity)

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary)**
- Background: 220 15% 12% (deep slate)
- Surface: 220 13% 18% (elevated cards)
- Border: 220 10% 25% (subtle divisions)
- Primary: 210 100% 60% (vibrant blue - actions/links)
- Text Primary: 0 0% 95% (high contrast)
- Text Secondary: 220 10% 65% (muted labels)
- Chord Highlight: 45 100% 65% (amber - active chord)
- Section Label: 160 60% 55% (teal - verse/chorus tags)

**Light Mode**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Border: 220 10% 88%
- Primary: 210 100% 50%
- Text Primary: 220 15% 20%
- Text Secondary: 220 8% 50%

### B. Typography
**Font Stack**: Inter (primary), JetBrains Mono (chord display)
- **Headers**: Inter 600, text-2xl to text-4xl
- **Body**: Inter 400, text-base
- **Chord Text**: JetBrains Mono 500, text-lg to text-xl (monospace for alignment)
- **Lyrics**: Inter 400, text-base with increased line-height (1.8)
- **UI Labels**: Inter 500, text-sm uppercase tracking-wide

### C. Layout System
**Spacing Primitives**: Tailwind units 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section gaps: gap-8, gap-12
- Card spacing: p-6
- Button spacing: px-4 py-2, px-6 py-3

**Grid Structure**:
- Main content: max-w-4xl centered
- Sidebar (library): w-64 to w-80
- Chord chart editor: Full-width with constrained inner content
- Responsive breakpoints: Stack at md and below

### D. Component Library

**1. Navigation/Header**
- Fixed top bar with app logo/title (left)
- Primary actions: "New Chart", "Save" (right side)
- Search bar (center, expandable)
- User profile/settings icon (far right)
- Height: h-16, backdrop blur with bg-opacity-90

**2. Library Sidebar**
- Collapsible panel (desktop visible, mobile drawer)
- Song list with title, artist, key display
- Filter/sort controls at top
- Alphabetical sections with dividers
- Hover states with subtle bg-surface elevation

**3. Chord Chart Display**
- Monospace chord text above aligned lyrics
- Section headers (Verse, Chorus) as colored pills/tags
- Line numbers (optional toggle)
- Playback position indicator (future feature placeholder)
- Clean whitespace, generous line-height for readability

**4. Editor Controls**
- Floating toolbar or top-mounted control panel
- Transpose buttons: [-] [Key Display] [+]
- Sharp/Flat toggle switch
- Section marker buttons (Add Verse/Chorus/Bridge)
- Font size controls (A- A+)
- Print/Export button

**5. Chord Input Interface**
- Click-to-edit inline on chart
- Autocomplete dropdown for common chords
- Recently used chords quick-access
- Validation for chord naming conventions

**6. Song Metadata Card**
- Title (editable, large text)
- Artist/composer field
- Original key display
- Current key (if transposed) with indicator
- Tags/genre (optional)

**7. Advanced: Section Builder**
- Drag-and-drop section arrangement
- Visual flow diagram (V1 → Chorus → V2)
- Duplicate/reorder/remove sections
- Compact representation with expand option

### E. Interaction Patterns

**Editing Flow**:
1. Clean, distraction-free chart view by default
2. Enter edit mode with single click/tap
3. Inline editing with clear visual feedback
4. Auto-save with timestamp indicator
5. Undo/redo support

**Transposition**:
- Real-time preview of transposed chords
- Clear before/after indication
- Confirm/cancel options for bulk changes

**Mobile Optimization**:
- Swipe gestures for section navigation
- Large touch targets for chord editing
- Collapsible controls to maximize chart space
- Portrait-optimized chord layout

### F. Visual Polish

**Cards & Surfaces**:
- Subtle rounded corners (rounded-lg)
- Minimal shadows (shadow-sm on hover)
- Border-based separation over heavy shadows

**Buttons**:
- Primary: Solid bg-primary with white text
- Secondary: Outline with border-primary
- Ghost: Hover state only
- Sizes: Small (px-3 py-1.5), Medium (px-4 py-2), Large (px-6 py-3)

**States**:
- Hover: Subtle brightness increase
- Active/Selected: Primary color background
- Disabled: 50% opacity
- Focus: Primary color ring

**No Animation** except:
- Smooth scroll to sections
- Fade transitions for modal/drawer appearances
- Loading states for save operations

---

## Key Design Principles

1. **Clarity First**: Chord charts must be instantly readable
2. **Minimal Distraction**: Clean interface, no unnecessary visual noise
3. **Quick Access**: Frequently used tools always visible
4. **Mobile-Ready**: Touch-friendly, responsive design
5. **Musician-Focused**: Dark mode default, high contrast, print-optimized

---

## Images
**No hero image required** - This is a utility application. Focus on functionality and interface clarity over marketing imagery.