import plugin$1 from 'fastify-plugin';
import development from './development.js';
import production from './production.js';
import { createRoute, createRouteHandler } from './route.js';

var plugin = plugin$1(async function (fastify, options) {
    const { routes } = process.env.NODE_ENV === "development"
        ? await development(fastify, options)
        : await production(fastify, options);
    for (const route of routes.server) {
        createRoute(fastify, route, routes.client, createRouteHandler());
    }
}, {
    name: "fastify-vite-vue-plugin",
});

export { plugin as default };
