import type { FastifyInstance } from "fastify";
import type { Options } from "./plugin";
export default function development(fastify: FastifyInstance, options: Options): Promise<import("./client").Client>;
