# NotationLite Init PRP

**Role:** You are a Senior Frontend Architect and Music Technology Specialist.
**Objective:** Build a web-based **Music Notation Viewer & Editor** prototype.
**Context:** This application is the foundation for a larger suite. It must strictly adhere to the "Model-View-Controller" pattern where the rendering is handled by **Verovio** and the logic is handled by a custom state manager.

---

## 1. Product Specification

**Name:** NotationLite
**Goal:** A browser-based application to view MEI/MusicXML files as standardized notation and perform atomic edits (pitch shift, delete).

### Core Features

1. **File Loading:** Upload `.mei` or `.musicxml` files.
2. **Rendering:** Display standardized notation using the **Verovio WASM** toolkit and **Bravura** font.
3. **Selection:** Click a note in the SVG to "select" it (visual feedback required).
4. **Atomic Editing (The "Round Trip"):**
* **Pitch Shift:** With a note selected, Arrow Up/Down moves the pitch diationally.
* **Toggle Accidental:** Toggle sharp/flat on the selected note.
* **Delete:** Pressing `Delete/Backspace` replaces the note with a rest of equivalent duration.



### Tech Stack (Strict)

* **Core Logic:** TypeScript (preferred) or Modern JavaScript (ES6+).
* **Rendering Engine:** [Verovio](https://www.verovio.org/) (WASM version).
* **Styling:** Tailwind CSS (for UI chrome only, not the score itself).
* **Build Tool:** Vite (for fast HMR and WASM support).
* **Testing:** Vitest (for unit logic).
* **Anti-Pattern:** Do NOT use HTML5 Canvas. Do NOT manually draw staves or beams. Use Verovio SVG output only.

---

## 2. Architectural Blueprint

You must implement a **State Manager** pattern to decouple the view from the data.

**The `ScoreManager` Class:**

* **State:** Holds the raw XML string (or parsed DOM) of the music file.
* **`load(data)`:** Initializes the Verovio toolkit with data.
* **`render()`:** Returns the SVG string from Verovio.
* **`select(id)`:** Validates if an element ID exists in the model.
* **`mutatePitch(id, direction)`:** Modifies the underlying XML pitch attributes.
* **`deleteNote(id)`:** Modifies the underlying XML to replace `<note>` with `<rest>`.

**The Flow:**

1. User Interaction (Click/Keypress) → 2. UI Event Handler → 3. `ScoreManager` updates XML Model → 4. `ScoreManager` feeds new XML to Verovio → 5. Verovio generates new SVG → 6. UI updates `innerHTML`.

---

## 3. Implementation Plan

**Phase 1: The Viewer Skeleton**

* Set up a Vite project with Tailwind.
* Initialize Verovio WASM.
* Create a file uploader that accepts text files.
* **Task:** Successfully render a hardcoded "Hello World" MusicXML string to the screen.

**Phase 2: The Interaction Layer**

* Implement the standard Verovio ID passthrough (ensure `xml:id` in the file matches `id` in the SVG).
* Add a Global Event Listener to the score container.
* **Task:** When a user clicks a note, highlight it (CSS class toggle) and log the ID to the console.

**Phase 3: The Mutation Logic (The Core)**

* Implement `ScoreManager.mutatePitch()`. This requires parsing the XML, finding the element, changing the `pname`/`oct` attributes, and serializing back to string.
* Implement `ScoreManager.deleteNote()`.
* **Task:** Connect the UI "Arrow Keys" to these functions and trigger a re-render.

---

## 4. The DevLoop & Verification Protocol

You are to follow a **Test-Driven DevLoop**. Before implementing complex XML manipulation logic, you must write the verification test first.

**The Loop:**

1. **Draft Test:** Write a Vitest unit test defining the expected input XML and output XML.
2. **Implement:** Write the minimal code in `ScoreManager` to pass the test.
3. **Verify:** Run the test. If it fails, analyze the XML diff, fix logic, and repeat.
4. **Integrate:** Only once logic passes, connect it to the Verovio UI.

### Required Unit Tests (Verification Gates)

You must implement these specific tests to verify the "Round Trip" works without visual confirmation:

**Test A: Pitch Shifting**

* *Input:* `<note xml:id="n1" pname="c" oct="4"/>`
* *Action:* `shiftPitch("n1", 1)` (Up)
* *Expected Output:* `<note xml:id="n1" pname="d" oct="4"/>` (Verify oct changes if crossing C/B boundary).

**Test B: Deletion**

* *Input:* `<measure><note xml:id="n1" dur="4"/></measure>`
* *Action:* `deleteNote("n1")`
* *Expected Output:* `<measure><rest dur="4"/></measure>` (Verify ID is handled or removed).

---

## 5. Execution Instructions

**Step 1:** logical_plan
Create a file named `PLAN.md`. Break down the Phases into checklist items.

**Step 2:** setup_environment
Generate the `package.json`, `vite.config.ts`, and `index.html` structure.

**Step 3:** core_logic
Create `ScoreManager.ts`. **STOP** and ask me to confirm the logic for XML parsing before proceeding to UI integration.

**Step 4:** ui_integration
Connect the pieces.

**Begin by creating the `PLAN.md`.**