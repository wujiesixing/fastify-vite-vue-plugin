'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plugin$1 = require('fastify-plugin');
var lruCache = require('lru-cache');
var development = require('./development.cjs');
var production = require('./production.cjs');
var route = require('./route.cjs');

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
            options.template?.cache instanceof lruCache.LRUCache
                ? options.template.cache
                : new lruCache.LRUCache(options.template?.cache ?? { max: 100 });
    }
    const opts = {
        ...options,
        template: { ...options.template, cache: templateLRUCache },
    };
    const { routes } = process.env.NODE_ENV === "development"
        ? await development.default(fastify, opts)
        : await production.default(fastify, opts);
    for (const route$1 of routes) {
        route.createRoute(fastify, route$1, route.createRouteHandler());
    }
}, {
    name: "fastify-vite-vue-plugin",
});

exports.default = plugin;
