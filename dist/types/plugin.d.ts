import type { Client } from "./client";
import type { ViteConfig } from "./resolveViteConfig";
export interface Options {
    viteConfig: string | ViteConfig;
    serverEntry: string;
    prepareClient?: (...args: any[]) => Promise<Client>;
}
declare const _default: (fastify: import("fastify").FastifyInstance<import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault>, options: Options) => Promise<void>;
export default _default;
