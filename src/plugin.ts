import plugin from "fastify-plugin";

import development from "./development";
import production from "./production";
import resolveViteConfig from "./resolveViteConfig";
import { createRoute, createRouteHandler } from "./route";

import type { Client } from "./client";

export interface Options {
  viteConfig: string;
  serverEntry: string;
  prepareClient?: (...args: any[]) => Promise<Client>;
}

export default plugin(
  async function (fastify, options: Options) {
    const viteConfig = await resolveViteConfig(options.viteConfig);

    const { routes } =
      process.env.NODE_ENV === "development"
        ? await development(fastify, options, viteConfig)
        : await production(fastify, options, viteConfig);

    for (const route of routes) {
      createRoute(fastify, route, createRouteHandler());
    }
  },
  {
    name: "fastify-vite-vue-plugin",
  }
);
