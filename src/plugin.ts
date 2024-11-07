import plugin from "fastify-plugin";

import development from "./development";
import production from "./production";
import { createRoute, createRouteHandler } from "./route";

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

export default plugin(
  async function (fastify, options: Options) {
    const { routes } =
      process.env.NODE_ENV === "development"
        ? await development(fastify, options)
        : await production(fastify, options);

    for (const route of routes.server) {
      createRoute(fastify, route, routes.client, createRouteHandler());
    }
  },
  {
    name: "fastify-vite-vue-plugin",
  }
);
