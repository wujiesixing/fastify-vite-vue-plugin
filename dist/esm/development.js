import { readFile } from 'node:fs/promises';
import middie from '@fastify/middie';
import prepareClient from './client.js';
import createHtmlFunction from './html.js';
import createRenderFunction from './render.js';
import resolveViteConfig from './resolveViteConfig.js';
import { resolve } from './utils-node.js';

async function development(fastify, options) {
    const { createServer, createServerModuleRunner, mergeConfig } = await import('vite');
    const viteConfig = await resolveViteConfig(options.server.viteConfig);
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
        const client = options.prepareClient
            ? await options.prepareClient(module)
            : prepareClient(module);
        return client;
    }
    fastify.addHook("onRequest", async (request, reply) => {
        const indexHtml = await readFile(resolve("index.html"), "utf-8");
        const template = await server.transformIndexHtml(request.url, indexHtml);
        reply.html = createHtmlFunction(template);
        reply.render = await createRenderFunction(await loadClient());
    });
    fastify.addHook("onClose", async () => {
        await runner.destroy();
        await server.close();
    });
    return await loadClient();
}

export { development as default };
