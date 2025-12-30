# Project State: NotationLite

**Status**: Functional Prototype (Phase 1 Complete)
**Last Updated**: 2025-12-30

## 1. Core Functionality
The application successfully implements the following core loop:
1.  **Load**: XML string -> `DOMParser` -> `ScoreManager` state.
2.  **Render**: `ScoreManager` -> `VerovioToolkit` -> SVG -> DOM.
3.  **Interact**: DOM Event -> `ScoreManager` Mutation -> Update XML -> Re-render.

## 2. Implemented Features & Fixes

### Logic & Data
-   [x] **ScoreManager**: Encapsulates all Verovio interaction and XML manipulation.
-   [x] **ID Synchronization Fix**: Input files lacking `xml:id` attributes (like K545) caused mismatches. The `ScoreManager` now pre-processes loaded XML to inject guaranteed unique IDs (`nl-xxxx`) into both `id` and `xml:id` attributes before passing data to Verovio.
-   [x] **Pitch Shifting**: Robust logic handling diatonic steps (C-B) and octave wrapping.
-   [x] **Deletion**: Replaces `<note>` with `<rest>` preserving duration and type.

### User Interface
-   [x] **Selection**: Verified click handlers map SVG elements back to the XML model accurately.
-   [x] **Visuals**: Selection highlight color set to **Orange** (`#FFA500`).
-   [x] **Fonts**: Configured to use **Bravura** (SMuFL) font instead of the default Leipzig. Font data served locally from `/public/fonts/`.
-   [x] **Optimistic UI**: Deletion operations apply an immediate `opacity: 0` style to the target element to mask WASM rendering latency (~0.5s for larger scores).

## 3. Known Issues / Limitations
-   **Large Files**: Rendering performance is tied to Verovio's full-score rendering. Large files (e.g., full string quartets) may have noticeable lag on re-render.
-   **Note Groups**: Selection logic currently targets individual noteheads/groups. Complex chords or beams may interpret selection differently depending on the SVG structure.
-   **Mutation Scope**: Currently only supports Pitch Shift and Deletion. No duration modification or new note insertion yet.

## 4. Pending / Next Steps
-   **Undo/Redo History**: Implement a state stack in `ScoreManager`.
-   **Save/Export**: Add button to download the modified XML/MEI.
-   **Duration Editing**: shortcuts to double/halve note duration.
