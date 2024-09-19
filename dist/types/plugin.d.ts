import type { Client } from "./client";
export interface Options {
    root: string;
    prepareClient?: (...args: any[]) => Promise<Client>;
    build: {
        outDir: {
            server: string;
            client: string;
        };
    };
    server: {
        entry: string;
        viteConfig: string;
    };
}
declare const _default: (fastify: import("fastify").FastifyInstance<import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault>, options: Options) => Promise<void>;
export default _default;
