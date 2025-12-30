import createVerovioModule from 'verovio/wasm';
import { VerovioToolkit } from 'verovio/esm';

export class ScoreManager {

    private toolkit: VerovioToolkit | null = null;
    private xmlDoc: XMLDocument | null = null;
    private serializer: XMLSerializer;
    private format: 'musicxml' | 'mei' = 'musicxml';

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
            fontPath: '/fonts/',
            // Horizontal galley view (no page breaks)
            breaks: 'none',
            // Make it very wide to force horizontal layout
            pageWidth: 60000,
            pageHeight: 2970
        });
    }

    load(data: string): void {
        const parser = new DOMParser();
        this.xmlDoc = parser.parseFromString(data, "text/xml");

        // Detect Format
        if (this.xmlDoc.documentElement.nodeName === 'mei') {
            this.format = 'mei';
            console.log("Format detected: MEI");
        } else {
            this.format = 'musicxml';
            console.log("Format detected: MusicXML");
        }

        // Pre-process: Add IDs if missing to ensure synchronization
        // MusicXML uses 'id' usually for parts, but we need unique IDs for all elements we want to interact with
        // Verovio generates them if missing, so we must add them FIRST to our DOM so we match.
        this.ensureUniqueIDs(this.xmlDoc);

        // Serialize back to string for Verovio so it sees our IDs
        const serializedData = this.getXML();
        // console.log("Serialized XML (Sample):", serializedData.substring(0, 500)); // Debug log warning

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
    // Helper to find element by xml:id
    private getElementById(id: string): Element | null {
        if (!this.xmlDoc) return null;

        // Use XPath for robust ID lookup handling namespaces (xml:id)
        try {
            // Check for xml:id
            const xpathXmlId = `//*[@xml:id="${id}"]`;
            const resultXmlId = this.xmlDoc.evaluate(xpathXmlId, this.xmlDoc, (prefix) => {
                if (prefix === 'xml') return 'http://www.w3.org/XML/1998/namespace';
                return null;
            }, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

            if (resultXmlId.singleNodeValue) {
                return resultXmlId.singleNodeValue as Element;
            }

            // Check for plain id
            const xpathId = `//*[@id="${id}"]`;
            const resultId = this.xmlDoc.evaluate(xpathId, this.xmlDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

            if (resultId.singleNodeValue) {
                return resultId.singleNodeValue as Element;
            }

        } catch (e) {
            console.warn("XPath evaluation failed:", e);
        }

        return null;
    }

    mutatePitch(id: string, direction: number): void {
        const note = this.getElementById(id);
        if (!note) {
            console.warn(`Note with id ${id} not found`);
            return;
        }

        const steps = ["C", "D", "E", "F", "G", "A", "B"];
        // MEI uses lowercase steps usually, MusicXML uppercase. We'll normalize.

        let currentStep = "C";
        let currentOct = 4;
        let stepEl: Element | null = null;
        let octEl: Element | null = null;

        if (this.format === 'musicxml') {
            // MusicXML: <note><pitch><step>C</step><octave>4</octave></pitch></note>
            const pitch = note.querySelector("pitch");
            if (!pitch) return;

            stepEl = pitch.querySelector("step");
            octEl = pitch.querySelector("octave");

            if (!stepEl || !octEl) return;

            currentStep = stepEl.textContent || "C";
            currentOct = parseInt(octEl.textContent || "4", 10);

        } else if (this.format === 'mei') {
            // MEI: <note pname="c" oct="4" ... />
            const pname = note.getAttribute("pname");
            const oct = note.getAttribute("oct");

            if (!pname || !oct) return;

            currentStep = pname.toUpperCase(); // Normalize to C, D, E
            currentOct = parseInt(oct, 10);
        }

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

        const newStep = steps[stepIndex];

        // Apply back
        if (this.format === 'musicxml') {
            if (stepEl) stepEl.textContent = newStep;
            if (octEl) octEl.textContent = newOct.toString();
        } else if (this.format === 'mei') {
            // MEI uses lowercase pname
            note.setAttribute("pname", newStep.toLowerCase());
            note.setAttribute("oct", newOct.toString());
        }

        // Update Verovio if loaded
        if (this.toolkit) {
            this.toolkit.loadData(this.getXML());
        }
    }

    select(id: string): boolean {
        const el = this.getElementById(id);
        console.log(`Select '${id}':`, el ? "Found" : "Not Found");
        return !!el;
    }

    deleteNote(id: string): void {
        const note = this.getElementById(id);
        if (!note) return;

        if (this.format === 'musicxml') {
            // MusicXML logic
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
            note.parentNode?.replaceChild(rest, note);

        } else if (this.format === 'mei') {
            // MEI Logic - replace <note> with <rest>
            // MEI notes have 'dur' attribute (e.g. "8", "4", "1")
            const dur = note.getAttribute("dur");

            const rest = this.xmlDoc!.createElementNS("http://www.music-encoding.org/ns/mei", "rest");
            if (dur) {
                rest.setAttribute("dur", dur);
            }

            // Note: MEI might use different attributes for dotted notes etc, ignoring for basic proto
            note.parentNode?.replaceChild(rest, note);
        }

        // Update Verovio
        if (this.toolkit) {
            this.toolkit.loadData(this.getXML());
        }
    }
}

