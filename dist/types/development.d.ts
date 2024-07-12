import type { FastifyInstance } from "fastify";
import type { Options } from "./plugin";
import type { ViteConfig } from "./resolveViteConfig";
export default function development(fastify: FastifyInstance, options: Options, viteConfig: ViteConfig): Promise<import("./client").Client>;
