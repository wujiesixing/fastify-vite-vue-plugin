import { renderToNodeStream, renderToString } from "vue/server-renderer";

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

export default async function createRenderFunction({
  create,
}: {
  create: CreateFunc;
}): Promise<RenderFunc> {
  return async function (request: FastifyRequest) {
    let stream = null;
    let body = null;

    if (!request.ctx?.csr) {
      const { app, ctx } = await create(request.ctx, request.url);

      if (request.ctx?.stream) {
        stream = renderToNodeStream(app, ctx);
      } else {
        body = await renderToString(app, ctx);
      }
    }

    return { ctx: request.ctx, body, stream };
  };
}
