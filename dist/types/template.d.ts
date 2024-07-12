import { Readable } from "node:stream";
type TemplateFunc<T = Record<string, any>> = (params: T) => Readable;
export default function createTemplateFunction(source: string): TemplateFunc;
export {};
