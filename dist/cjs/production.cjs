'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var node_fs = require('node:fs');
var promises = require('node:fs/promises');
var node_path = require('node:path');
var node_url = require('node:url');
var fastifyStatic = require('@fastify/static');
var client = require('./client.cjs');
var html = require('./html.cjs');
var render = require('./render.cjs');
var utilsNode = require('./utils-node.cjs');

async function production(fastify, options) {
    const { root, build } = options;
    const { outDir } = build;
    const clientDist = utilsNode.resolve(root, outDir.client);
    if (!node_fs.existsSync(clientDist)) {
        throw new Error("没有发现客户端的包，请执行 pnpm run build:client");
    }
    const serverDist = utilsNode.resolve(root, outDir.server);
    if (!node_fs.existsSync(serverDist)) {
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
        root: utilsNode.resolve(clientDist),
        prefix: `/`,
        preCompressed: true,
        wildcard: false,
        index: false,
    });
    const { client: client$1, manifest } = await loadClient();
    fastify.decorateReply("render", await render.default({ ...client$1, manifest }));
    const indexHtml = await promises.readFile(node_path.join(clientDist, "index.html"), "utf-8");
    fastify.decorateReply("html", html.default(indexHtml, options.template));
    async function loadClient() {
        const ssrManifest = node_path.join(clientDist, ".vite", "ssr-manifest.json");
        const manifest = JSON.parse(node_fs.readFileSync(ssrManifest, "utf-8"));
        const serverInput = node_path.join(serverDist, "index.js");
        const module = await import(node_url.pathToFileURL(serverInput).href);
        const client$1 = options.prepareClient
            ? await options.prepareClient(module)
            : client.default(module);
        return { client: client$1, manifest };
    }
    return client$1;
}

exports.default = production;
