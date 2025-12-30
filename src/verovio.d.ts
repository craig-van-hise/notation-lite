declare module 'verovio/wasm' {
    export default function createVerovioModule(): Promise<any>;
}

declare module 'verovio/esm' {
    export class VerovioToolkit {
        constructor(module?: any);
        loadData(data: string): boolean;
        renderToSVG(page: number, options: any): string;
        setOptions(options: any): void;
        // Add other methods as needed
    }
}
