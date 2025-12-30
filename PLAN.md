# NotationLite Implementation Plan

Derived from `PRPs/# Init PRP.md`.

## Phase 1: The Viewer Skeleton
- [ ] **Setup Project Structure**
    - [ ] Initialize Vite project with TypeScript.
    - [ ] Install dependencies: `verovio`, `tailwindcss`, `vite`, `vitest`.
    - [ ] Configure Tailwind CSS.
- [ ] **Initialize Verovio**
    - [ ] Set up Verovio WASM module loading.
    - [ ] Create basic `ScoreManager` class structure.
- [ ] **File Uploader**
    - [ ] properties to accept `.mei` and `.musicxml`.
    - [ ] Read file content as string.
- [ ] **Hello World Render**
    - [ ] Render a hardcoded MusicXML string to SVG.
    - [ ] Display SVG in the DOM.

## Phase 2: The Interaction Layer
- [ ] **ID Passthrough**
    - [ ] Ensure Verovio options preserve `xml:id`.
- [ ] **Selection State**
    - [ ] Track selected element ID in `ScoreManager`.
    - [ ] Apply visual styling (CSS class) to selected note in SVG.
- [ ] **Event Listeners**
    - [ ] Add click listener to SVG container.
    - [ ] Hit-test for notes/elements and update selection.

## Phase 3: The Mutation Logic (The Core)
- [ ] **XML Parsing**
    - [ ] Parse XML string into DOM object in `ScoreManager`.
- [ ] **Pitch Mutation (`mutatePitch`)**
    - [ ] Implement robust pitch shifting logic (handling octaves).
    - [ ] **Verification:** Pass `Test A: Pitch Shifting` unit test.
- [ ] **Note Deletion (`deleteNote`)**
    - [ ] Implement note-to-rest replacement.
    - [ ] **Verification:** Pass `Test B: Deletion` unit test.
- [ ] **Keyboard Integration**
    - [ ] Bind Arrow Up/Down to `mutatePitch`.
    - [ ] Bind Delete/Backspace to `deleteNote`.
    - [ ] Trigger re-render after mutations.

## Phase 4: Verification & Polish
- [ ] **Automated Testing**
    - [ ] Run comprehensive Vitest suite for `ScoreManager`.
- [ ] **Manual Verification**
    - [ ] Load sample files.
    - [ ] Verify click selection.
    - [ ] Verify pitch shifts and deletions visually.
- [ ] **Cleanup**
    - [ ] Ensure clean code structure.
    - [ ] Add comments and documentation.
