'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var promises = require('node:fs/promises');
var middie = require('@fastify/middie');
var client = require('./client.cjs');
var html = require('./html.cjs');
var render = require('./render.cjs');
var resolveViteConfig = require('./resolveViteConfig.cjs');
var utils = require('./utils.cjs');

async function development(fastify, options) {
    const { createServer, createServerModuleRunner, mergeConfig } = await import('vite');
    const viteConfig = await resolveViteConfig.default(options.server.viteConfig);
    const config = mergeConfig({
        root: options.root,
        configFile: false,
        server: { middlewareMode: true },
        appType: "custom",
    }, viteConfig);
    const server = await createServer(config);
    const runner = await createServerModuleRunner(server.environments.ssr);
    await fastify.register(middie);
    fastify.use(server.middlewares);
    fastify.decorateReply("render", null);
    fastify.decorateReply("html", null);
    async function loadClient() {
        const module = await runner.import(options.server.entry);
        const client$1 = options.prepareClient
            ? await options.prepareClient(module)
            : client.default(module);
        return client$1;
    }
    fastify.addHook("onRequest", async (request, reply) => {
        const indexHtml = await promises.readFile(utils.resolve("index.html"), "utf-8");
        const template = await server.transformIndexHtml(request.url, indexHtml);
        reply.html = html.default(template);
        reply.render = await render.default(await loadClient());
    });
    fastify.addHook("onClose", async () => {
        await runner.destroy();
        await server.close();
    });
    return await loadClient();
}

exports.default = development;
