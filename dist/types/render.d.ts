import type { FastifyRequest } from "fastify";
import { Readable } from "stream";
import { CreateFunc } from "./client";
import { SSRContext } from "./route";
export interface RenderResponse {
    ctx: SSRContext;
    body: string | null;
    stream: Readable | null;
}
export type RenderFunc = (request: FastifyRequest) => Promise<RenderResponse>;
export default function createRenderFunction({ create, }: {
    create: CreateFunc;
}): Promise<RenderFunc>;
