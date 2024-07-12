'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plugin$1 = require('fastify-plugin');
var development = require('./development.cjs');
var production = require('./production.cjs');
var resolveViteConfig = require('./resolveViteConfig.cjs');
var route = require('./route.cjs');

var plugin = plugin$1(async function (fastify, options) {
    const viteConfig = await resolveViteConfig.default(options.viteConfig);
    const { routes } = process.env.NODE_ENV === "development"
        ? await development.default(fastify, options, viteConfig)
        : await production.default(fastify, options, viteConfig);
    for (const route$1 of routes) {
        route.createRoute(fastify, route$1, route.createRouteHandler());
    }
}, {
    name: "fastify-vite-vue-plugin",
});

exports.default = plugin;
