import type { Readable } from "node:stream";
export { default as createTemplateFunction } from "./template";
export declare function resolve(...args: string[]): string;
export declare function generateStream(...chunks: Array<string | Readable>): AsyncGenerator<any, void, unknown>;
