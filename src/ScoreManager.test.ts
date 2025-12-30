import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreManager } from './ScoreManager';

describe('ScoreManager Logic', () => {
    let scoreManager: ScoreManager;

    beforeEach(() => {
        scoreManager = new ScoreManager();
    });

    it('Test A: Pitch Shifting (Up)', () => {
        // Minimal MusicXML snippet for testing
        const inputXML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise>
  <part id="P1">
    <measure number="1">
      <note xml:id="n1">
        <pitch>
          <step>C</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
      </note>
    </measure>
  </part>
</score-partwise>`;

        scoreManager.load(inputXML);
        scoreManager.mutatePitch("n1", 1);

        const outputXML = scoreManager.getXML();

        // We expect C4 -> D4
        expect(outputXML).toContain('<step>D</step>');
        expect(outputXML).toContain('<octave>4</octave>');
    });

    it('Test A: Pitch Shifting (Octave Up)', () => {
        const inputXML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise>
  <part id="P1">
    <measure number="1">
      <note xml:id="n2">
        <pitch>
          <step>B</step>
          <octave>4</octave>
        </pitch>
      </note>
    </measure>
  </part>
</score-partwise>`;

        scoreManager.load(inputXML);
        scoreManager.mutatePitch("n2", 1);

        const outputXML = scoreManager.getXML();
        // B4 -> C5
        expect(outputXML).toContain('<step>C</step>');
        expect(outputXML).toContain('<octave>5</octave>');
    });

    it('Test B: Deletion (Note to Rest)', () => {
        const inputXML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise>
  <part id="P1">
    <measure number="1">
      <note xml:id="n_del">
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>4</duration>
        <type>whole</type>
      </note>
    </measure>
  </part>
</score-partwise>`;

        scoreManager.load(inputXML);
        scoreManager.deleteNote("n_del");

        const outputXML = scoreManager.getXML();
        // Should contain rest with same duration and type
        expect(outputXML).not.toContain('<note');
        expect(outputXML).toContain('<rest');
        expect(outputXML).toContain('<duration>4</duration>');
        expect(outputXML).toContain('<type>whole</type>');
    });
});
