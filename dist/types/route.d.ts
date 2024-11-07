import type { FastifyInstance, RouteHandlerMethod } from "fastify";
import type { RouteRecordRaw } from "vue-router";
import type { SSRContext as VueSSRContext } from "vue/server-renderer";
import type { RenderOptions, RouteServer } from "./routes";
export interface SSRContext extends VueSSRContext, RenderOptions, Omit<RouteServer, "render"> {
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
export declare function createRoute(fastify: FastifyInstance, route: RouteServer, routes: () => RouteRecordRaw[], handler: RouteHandlerMethod): void;
export declare function createRouteHandler(): RouteHandlerMethod;
