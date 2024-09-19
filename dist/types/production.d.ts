import type { FastifyInstance } from "fastify";
import type { Options } from "./plugin";
export type Manifest = Record<string, string[]>;
export default function production(fastify: FastifyInstance, options: Options): Promise<import("./client").Client>;
