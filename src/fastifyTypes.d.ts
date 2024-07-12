import "fastify";
import { HtmlFunc } from "./html";
import { RenderFunc } from "./render";
import { SSRContext } from "./route";

declare module "fastify" {
  interface FastifyRequest {
    ctx: SSRContext;
  }
  interface FastifyReply {
    render: RenderFunc;
    html: HtmlFunc;
  }
}
