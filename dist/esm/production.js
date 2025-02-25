import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import fastifyStatic from '@fastify/static';
import prepareClient from './client.js';
import createHtmlFunction from './html.js';
import createRenderFunction from './render.js';
import { resolve } from './utils-node.js';

async function production(fastify, options) {
    const { root, build } = options;
    const { outDir } = build;
    const clientDist = resolve(root, outDir.client);
    if (!existsSync(clientDist)) {
        throw new Error("没有发现客户端的包，请执行 pnpm run build:client");
    }
    const serverDist = resolve(root, outDir.server);
    if (!existsSync(serverDist)) {
        throw new Error("没有发现客户端的包，请执行 pnpm run build:server");
    }
    fastify.addHook("onRequest", async (request, reply) => {
        const { url } = request;
        const matches = url.match(/^\/+([^\/?#]+)/);
        if (matches) {
            const firstPath = matches[1]?.toLowerCase();
            if (/index\.html(\.br|\.gz)?/.test(firstPath)) {
                reply.code(302).redirect(url.replace(firstPath, ""));
                return;
            }
        }
    });
    fastify.register(fastifyStatic, {
        root: resolve(clientDist),
        prefix: `/`,
        preCompressed: true,
        wildcard: false,
        index: false,
    });
    const { client, manifest } = await loadClient();
    fastify.decorateReply("render", await createRenderFunction({ ...client, manifest }));
    const indexHtml = await readFile(join(clientDist, "index.html"), "utf-8");
    fastify.decorateReply("html", createHtmlFunction(indexHtml, options.template));
    async function loadClient() {
        const ssrManifest = join(clientDist, ".vite", "ssr-manifest.json");
        const manifest = JSON.parse(readFileSync(ssrManifest, "utf-8"));
        const serverInput = join(serverDist, "index.js");
        const module = await import(pathToFileURL(serverInput).href);
        const client = options.prepareClient
            ? await options.prepareClient(module)
            : prepareClient(module);
        return { client, manifest };
    }
    return client;
}

export { production as default };
