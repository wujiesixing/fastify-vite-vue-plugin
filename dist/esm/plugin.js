import plugin$1 from 'fastify-plugin';
import development from './development.js';
import production from './production.js';
import resolveViteConfig from './resolveViteConfig.js';
import { createRoute, createRouteHandler } from './route.js';

var plugin = plugin$1(async function (fastify, options) {
    const viteConfig = typeof options.viteConfig === "string"
        ? await resolveViteConfig(options.viteConfig)
        : options.viteConfig;
    const { routes } = process.env.NODE_ENV === "development"
        ? await development(fastify, options, viteConfig)
        : await production(fastify, options, viteConfig);
    for (const route of routes) {
        createRoute(fastify, route, createRouteHandler());
    }
}, {
    name: "fastify-vite-vue-plugin",
});

export { plugin as default };
