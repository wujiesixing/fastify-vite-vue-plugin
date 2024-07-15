import type { Readable } from "node:stream";
export declare function resolve(...args: string[]): string;
export declare function generateStream(...chunks: Array<string | Readable>): AsyncGenerator<any, void, unknown>;
