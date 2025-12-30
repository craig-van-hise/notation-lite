import createVerovioModule from 'verovio/wasm';
import { VerovioToolkit } from 'verovio/esm';

export class ScoreManager {

    private toolkit: VerovioToolkit | null = null;
    private xmlDoc: XMLDocument | null = null;
    private serializer: XMLSerializer;

    constructor() {
        // Toolkit is initialized asynchronously
        this.serializer = new XMLSerializer();
    }

    async init(): Promise<void> {
        const verovioModule = await createVerovioModule();
        // Correct instantiation
        this.toolkit = new VerovioToolkit(verovioModule);
        console.log("Verovio toolkit initialized");


        // Set options
        this.toolkit?.setOptions({
            scale: 50,
            adjustPageHeight: true,
            font: 'Bravura',
            fontPath: '/fonts/'
        });
    }

    load(data: string): void {
        const parser = new DOMParser();
        this.xmlDoc = parser.parseFromString(data, "text/xml");

        // Pre-process: Add IDs if missing to ensure synchronization
        // MusicXML uses 'id' usually for parts, but we need unique IDs for all elements we want to interact with
        // Verovio generates them if missing, so we must add them FIRST to our DOM so we match.
        this.ensureUniqueIDs(this.xmlDoc);

        // Serialize back to string for Verovio so it sees our IDs
        const serializedData = this.getXML();
        console.log("Serialized XML (Sample):", serializedData.substring(0, 500)); // Debug log

        if (this.toolkit) {
            this.toolkit.loadData(serializedData);
        }
    }

    private ensureUniqueIDs(doc: XMLDocument): void {
        const elements = doc.getElementsByTagName("*");
        const xmlNamespace = "http://www.w3.org/XML/1998/namespace";

        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            // Check both standard id and xml:id
            const hasId = el.hasAttribute("id") || el.hasAttribute("xml:id") || el.hasAttributeNS(xmlNamespace, "id");

            if (!hasId) {
                const uniqueId = `nl-${Math.random().toString(36).substr(2, 9)}`;

                // Set plain 'id' (MusicXML friendly)
                el.setAttribute("id", uniqueId);

                // Set 'xml:id' (Standard XML / MEI friendly)
                el.setAttributeNS(xmlNamespace, "id", uniqueId);
            }
        }
    }

    render(): string {
        if (!this.toolkit) {
            throw new Error("Verovio toolkit not initialized");
        }
        return this.toolkit.renderToSVG(1, {});
    }

    getXML(): string {
        if (!this.xmlDoc) return "";
        return this.serializer.serializeToString(this.xmlDoc);
    }

    // Helper to find element by xml:id
    private getElementById(id: string): Element | null {
        if (!this.xmlDoc) return null;
        // Try standard ID lookups
        // Note: XML files might use 'id' or 'xml:id'
        const el = this.xmlDoc.querySelector(`[xml\\:id="${id}"]`) || this.xmlDoc.querySelector(`[id="${id}"]`);
        return el;
    }

    mutatePitch(id: string, direction: number): void {
        const note = this.getElementById(id);
        if (!note) {
            console.warn(`Note with id ${id} not found`);
            return;
        }

        // Check if it's a note (MusicXML specifics)
        // We look for children <step> and <octave> inside <pitch>
        // Depending on structure, might be note -> pitch -> step/octave
        const pitch = note.querySelector("pitch");
        if (!pitch) return;

        const stepEl = pitch.querySelector("step");
        const octEl = pitch.querySelector("octave");

        if (!stepEl || !octEl) return;

        const steps = ["C", "D", "E", "F", "G", "A", "B"];
        const currentStep = stepEl.textContent || "C";
        const currentOct = parseInt(octEl.textContent || "4", 10);

        let stepIndex = steps.indexOf(currentStep);
        if (stepIndex === -1) stepIndex = 0; // Fallback

        // Apply shift
        stepIndex += direction;

        let newOct = currentOct;

        // Handle wrapping
        if (stepIndex > 6) {
            stepIndex = 0;
            newOct++;
        } else if (stepIndex < 0) {
            stepIndex = 6;
            newOct--;
        }

        stepEl.textContent = steps[stepIndex];
        octEl.textContent = newOct.toString();

        // Update Verovio if loaded
        if (this.toolkit) {
            this.toolkit.loadData(this.getXML());
        }
    }

    select(id: string): boolean {
        return !!this.getElementById(id);
    }

    deleteNote(id: string): void {
        const note = this.getElementById(id);
        if (!note) return;

        // Get duration before deleting
        const durationEl = note.querySelector("duration");
        const typeEl = note.querySelector("type");
        const duration = durationEl ? durationEl.textContent : null;
        const type = typeEl ? typeEl.textContent : null;

        // Create Rest
        const rest = this.xmlDoc!.createElement("rest");
        if (duration) {
            const newDur = this.xmlDoc!.createElement("duration");
            newDur.textContent = duration;
            rest.appendChild(newDur);
        }
        if (type) {
            const newType = this.xmlDoc!.createElement("type");
            newType.textContent = type;
            rest.appendChild(newType);
        }

        // Replace note with rest
        note.parentNode?.replaceChild(rest, note);

        // Update Verovio
        if (this.toolkit) {
            this.toolkit.loadData(this.getXML());
        }
    }
}

