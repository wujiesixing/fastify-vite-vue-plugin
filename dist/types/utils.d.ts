import type { Readable } from "node:stream";
export declare function resolve(...args: string[]): string;
export declare function generateStream(...chunks: Array<string | Readable>): AsyncGenerator<any, void, unknown>;
export declare function deepFreeze<T>(object: T): Readonly<T>;
export declare function filterDeep<T extends object>(items: T[], predicate: (value: T, index: number, array: T[]) => unknown, deepPath: string): T[];
