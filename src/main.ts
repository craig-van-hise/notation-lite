import './style.css'
import { ScoreManager } from './ScoreManager';


const notationContainer = document.getElementById('notation')!;

// Hardcoded Hello World MusicXML
const HELLO_WORLD_XML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Music</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <note>
        <pitch>
          <step>C</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>whole</type>
      </note>
    </measure>
  </part>
</score-partwise>`;

const scoreManager = new ScoreManager();


const fileInput = document.getElementById('file-input') as HTMLInputElement;

let selectedId: string | null = null;

function render() {
  try {
    const svg = scoreManager.render();
    notationContainer.innerHTML = svg;

    // Re-apply selection if still valid
    if (selectedId && scoreManager.select(selectedId)) {
      highlightNote(selectedId);
    } else {
      selectedId = null;
    }
  } catch (e) {
    console.error("Render failed:", e);
  }
}

function highlightNote(id: string) {
  // Remove previous highlights
  document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));

  // Add highlight
  // Verovio renders notes as groups with the ID
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('selected');
    selectedId = id;
    console.log("Selected:", id);
  }
}

// Event Listeners
if (fileInput) {
  fileInput.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const text = await file.text();
    scoreManager.load(text);
    render();
    selectedId = null;
  });
}

notationContainer.addEventListener('click', (e) => {
  let target = e.target as Element;

  // Traverse up to find a note group
  const noteGroup = target.closest('.note');
  if (noteGroup && noteGroup.id) {
    // Validate with ScoreManager
    if (scoreManager.select(noteGroup.id)) {
      highlightNote(noteGroup.id);
      // Stop propagation to avoid clearing selection immediately if we had that logic
      e.stopPropagation();
    }
  } else {
    // Clicked empty space? Deselect?
  }
});

document.addEventListener('keydown', async (e) => {
  if (!selectedId) return;

  if (e.key === 'ArrowUp') {
    e.preventDefault();

    // Optimistic UI: Visually move up immediately
    // A single staff step is roughly 1/8th of a space? 
    // Verovio usually scales everything. 
    // Let's approximate: 25px per 50 scale?
    // We'll just translate Y by -5px as an immediate visual cue
    // This is tricky because "Up" means lower Y value in SVG.

    const el = document.getElementById(selectedId);
    if (el) {
      console.log("Optimistic update on:", selectedId);
      // Use CSS transform instead of SVG attribute for better browser support
      el.style.transform = 'translateY(-10px)';
      el.getBoundingClientRect();
    } else {
      console.warn("Optimistic update failed: Element not found", selectedId);
    }

    // Defer heavy lift
    requestAnimationFrame(() => {
      setTimeout(() => {
        scoreManager.mutatePitch(selectedId!, 1);
        render();
      }, 50);
    });

  } else if (e.key === 'ArrowDown') {
    e.preventDefault();

    const el = document.getElementById(selectedId);
    if (el) {
      console.log("Optimistic update on:", selectedId);
      el.style.transform = 'translateY(10px)';
      el.getBoundingClientRect();
    } else {
      console.warn("Optimistic update failed: Element not found", selectedId);
    }

    requestAnimationFrame(() => {
      setTimeout(() => {
        scoreManager.mutatePitch(selectedId!, -1);
        render();
      }, 50);
    });

  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();

    // Optimistic UI: Hide the element immediately
    const el = document.getElementById(selectedId);
    if (el) {
      el.style.opacity = '0'; // Fade out instantly
    }

    // Allow the UI to paint the opacity change before locking up with WASM
    requestAnimationFrame(() => {
      setTimeout(() => {
        scoreManager.deleteNote(selectedId!);
        render();
      }, 10);
    });
  }
});

async function init() {
  try {
    await scoreManager.init();
    scoreManager.load(HELLO_WORLD_XML);
    render();
  } catch (e) {
    console.error("Failed to initialize or render:", e);
    notationContainer.innerText = "Error loading Verovio: " + e;
  }
}

init();

console.log("NotationLite Initialized");

