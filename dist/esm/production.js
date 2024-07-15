import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import fastifyStatic from '@fastify/static';
import prepareClient from './client.js';
import createHtmlFunction from './html.js';
import createRenderFunction from './render.js';
import { resolve } from './utils-node.js';

async function production(fastify, options, viteConfig) {
    const { root, build } = viteConfig;
    const { outDir, assetsDir } = build;
    const clientDist = resolve(root, outDir, "client");
    if (!existsSync(clientDist)) {
        throw new Error("没有发现客户端的包，请执行 pnpm run build:client");
    }
    const serverDist = resolve(root, outDir, "server");
    if (!existsSync(serverDist)) {
        throw new Error("没有发现客户端的包，请执行 pnpm run build:server");
    }
    fastify.register(fastifyStatic, {
        root: resolve(clientDist, assetsDir),
        prefix: `/${assetsDir}/`,
    });
    const { client } = await loadClient();
    fastify.decorateReply("render", await createRenderFunction(client));
    const indexHtml = await readFile(resolve("index.html"), "utf-8");
    fastify.decorateReply("html", createHtmlFunction(indexHtml));
    async function loadClient() {
        const ssrManifest = resolve(clientDist, ".vite", "ssr-manifest.json");
        const serverInput = resolve(serverDist, "index.js");
        const module = await import(serverInput);
        const client = options.prepareClient
            ? await options.prepareClient(module)
            : prepareClient(module);
        return { client, ssrManifest };
    }
    return client;
}

export { production as default };
