import plugin from "fastify-plugin";
import { LRUCache } from "lru-cache";

import development from "./development";
import production from "./production";
import { createRoute, createRouteHandler } from "./route";

import type { LRUCache as LRUCacheType } from "lru-cache";
import type { Client } from "./client";
import type { TemplateFunc } from "./template";

export interface Options {
  root: string;
  prepareClient?: (...args: any[]) => Promise<Client>;
  template?: {
    cache?:
      | false
      | LRUCache<string, TemplateFunc, unknown>
      | LRUCacheType.Options<string, TemplateFunc, unknown>;
  };
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
    if (!options.root) {
      throw new Error("root option is required");
    }

    if (!options.build?.outDir?.server || !options.build?.outDir?.client) {
      throw new Error(
        "build.outDir.server and build.outDir.client are required"
      );
    }

    if (!options.server?.entry || !options.server?.viteConfig) {
      throw new Error("server.entry and server.viteConfig are required");
    }

    let templateLRUCache: LRUCache<string, TemplateFunc, unknown> | undefined;

    if (options.template?.cache !== false) {
      templateLRUCache =
        options.template?.cache instanceof LRUCache
          ? options.template.cache
          : new LRUCache<string, TemplateFunc>(
              options.template?.cache ?? { max: 100 }
            );
    }

    const opts: Options = {
      ...options,
      template: { ...options.template, cache: templateLRUCache },
    };

    const { routes } =
      process.env.NODE_ENV === "development"
        ? await development(fastify, opts)
        : await production(fastify, opts);

    for (const route of routes) {
      createRoute(fastify, route, createRouteHandler());
    }
  },
  {
    name: "fastify-vite-vue-plugin",
  }
);
