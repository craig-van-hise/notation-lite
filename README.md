# NotationLite

NotationLite is a lightweight, web-based Music Notation Viewer & Editor prototype built with **Verovio** and **TypeScript**. It demonstrates an "atomic editing" architecture where changes are made to an internal XML Model and re-rendered via Verovio (Round-Trip editing).

## Features

-   **File Loading**: Supports MusicXML `.xml` and MEI `.mei` files.
-   **Rendering**: High-quality SVG rendering using the **Verovio WASM** engine with the **Bravura** SMuFL font.
-   **Selection**: Click noteheads to select them (Visual feedback: Orange).
-   **Atomic Editing**:
    -   **Pitch Shift**: Use `Arrow Up` / `Arrow Down` to move notes diatonically. Handles octave wrapping.
    -   **Deletion**: Use `Delete` or `Backspace` to replace notes with rests of equivalent duration.
-   **Optimistic UI**: Deletion interactions provide instant visual feedback before the WASM engine completes rendering.

## Technology Stack

-   **Framework**: [Vite](https://vitejs.dev/) (Vanilla TypeScript)
-   **Notation Engine**: [Verovio](https://www.verovio.org/) (WASM)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Testing**: [Vitest](https://vitest.dev/) with JSDOM

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start the development server**:
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

3.  **Run tests**:
    ```bash
    npm test
    ```

## Architecture Usage Notes

-   **Font Assets**: The Bravura font files are served from `public/fonts/bravura/` to allow Verovio to access them via XHR/Fetch.
-   **ID Management**: The application automatically injects unique `xml:id` attributes into loaded MusicXML files to ensure synchronization between the DOM interaction layer and the Verovio internal model.
