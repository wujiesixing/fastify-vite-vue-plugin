import plugin$1 from 'fastify-plugin';
import { LRUCache } from 'lru-cache';
import development from './development.js';
import production from './production.js';
import { createRoute, createRouteHandler } from './route.js';

var plugin = plugin$1(async function (fastify, options) {
    if (!options.root) {
        throw new Error("root option is required");
    }
    if (!options.build?.outDir?.server || !options.build?.outDir?.client) {
        throw new Error("build.outDir.server and build.outDir.client are required");
    }
    if (!options.server?.entry || !options.server?.viteConfig) {
        throw new Error("server.entry and server.viteConfig are required");
    }
    let templateLRUCache;
    if (options.template?.cache !== false) {
        templateLRUCache =
            options.template?.cache instanceof LRUCache
                ? options.template.cache
                : new LRUCache(options.template?.cache ?? { max: 100 });
    }
    const opts = {
        ...options,
        template: { ...options.template, cache: templateLRUCache },
    };
    const { routes } = process.env.NODE_ENV === "development"
        ? await development(fastify, opts)
        : await production(fastify, opts);
    for (const route of routes) {
        createRoute(fastify, route, createRouteHandler());
    }
}, {
    name: "fastify-vite-vue-plugin",
});

export { plugin as default };
