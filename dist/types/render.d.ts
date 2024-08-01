import type { FastifyRequest } from "fastify";
import type { Readable } from "stream";
import type { CreateFunc } from "./client";
import type { Manifest } from "./production";
import type { SSRContext } from "./route";
export interface RenderResponse {
    ctx: SSRContext;
    body: string | null;
    stream: Readable | null;
    preloadLinks: string | null;
}
export type RenderFunc = (request: FastifyRequest) => Promise<RenderResponse>;
export default function createRenderFunction({ create, manifest, }: {
    create: CreateFunc;
    manifest?: Manifest;
}): Promise<RenderFunc>;
