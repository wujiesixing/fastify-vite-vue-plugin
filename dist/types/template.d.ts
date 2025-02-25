import { Readable } from "node:stream";
import type { LRUCache as LRUCacheType } from "lru-cache";
export type TemplateFunc<T = Record<string, any>> = (params: T) => Readable;
export interface TemplateOptions {
    cache?: LRUCacheType<string, TemplateFunc>;
}
export default function createTemplateFunction(source: string, options?: TemplateOptions): TemplateFunc;
