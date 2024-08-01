import type { FastifyInstance } from "fastify";
import type { Options } from "./plugin";
import type { ViteConfig } from "./resolveViteConfig";
export type Manifest = Record<string, string[]>;
export default function production(fastify: FastifyInstance, options: Options, viteConfig: ViteConfig): Promise<import("./client").Client>;
