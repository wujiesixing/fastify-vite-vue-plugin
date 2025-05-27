import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteHandlerMethod,
} from "fastify";
import type { SSRContext as VueSSRContext } from "vue/server-renderer";
import type { RenderOptions, RouteNode } from "./routes";

export interface SSRContext extends VueSSRContext, RenderOptions {
  hostname: string;
  url: string;
  firstRender: boolean;
  state: null | Record<string, any>;
  data: Array<{
    id: symbol;
    baseURL?: string;
    url?: string;
    params?: string;
    data?: string;
    method?: string;
    end: null | number;
    resolve: null | any;
    reject: null | any;
  }>;
  timestamp: number;
  cookies: { [cookieName: string]: string | undefined };
}

export function createRoute(
  fastify: FastifyInstance,
  route: RouteNode,
  handler: RouteHandlerMethod
) {
  fastify.get(route.path, {
    async onRequest(request, reply) {
      if (route.redirect) {
        reply.code(302).redirect(route.redirect);
        return;
      }

      request.ctx = {
        ...route.render,
        head: route.head,
        hostname: request.hostname,
        url: request.url,
        firstRender: true,
        state: null,
        data: [],
        timestamp: Date.now(),
        cookies: request.cookies
          ? JSON.parse(JSON.stringify(request.cookies))
          : {},
      };
    },
    handler,
  });
}

export function createRouteHandler(): RouteHandlerMethod {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    reply.html(await reply.render(request));
    return reply;
  };
}
