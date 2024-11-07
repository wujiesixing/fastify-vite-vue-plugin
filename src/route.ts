import { omit } from "lodash-es";

import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteHandlerMethod,
} from "fastify";
import type { RouteRecordRaw } from "vue-router";
import type { SSRContext as VueSSRContext } from "vue/server-renderer";
import type { RenderOptions, RouteServer } from "./routes";

export interface SSRContext
  extends VueSSRContext,
    RenderOptions,
    Omit<RouteServer, "render"> {
  hostname: string;
  routes: RouteRecordRaw[];
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
}

export function createRoute(
  fastify: FastifyInstance,
  route: RouteServer,
  routes: () => RouteRecordRaw[],
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
        ...omit(route, ["render"]),
        hostname: request.hostname,
        routes: routes(),
        url: request.url,
        firstRender: true,
        state: null,
        data: [],
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
