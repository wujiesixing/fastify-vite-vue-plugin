'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var node_fs = require('node:fs');
var promises = require('node:fs/promises');
var fastifyStatic = require('@fastify/static');
var client = require('./client.cjs');
var html = require('./html.cjs');
var render = require('./render.cjs');
var utils = require('./utils.cjs');

async function production(fastify, options, viteConfig) {
    const { root, build } = viteConfig;
    const { outDir, assetsDir } = build;
    const clientDist = utils.resolve(root, outDir, "client");
    if (!node_fs.existsSync(clientDist)) {
        throw new Error("没有发现客户端的包，请执行 pnpm run build:client");
    }
    const serverDist = utils.resolve(root, outDir, "server");
    if (!node_fs.existsSync(serverDist)) {
        throw new Error("没有发现客户端的包，请执行 pnpm run build:server");
    }
    fastify.register(fastifyStatic, {
        root: utils.resolve(clientDist, assetsDir),
        prefix: `/${assetsDir}/`,
    });
    const { client: client$1 } = await loadClient();
    fastify.decorateReply("render", await render.default(client$1));
    const indexHtml = await promises.readFile(utils.resolve("index.html"), "utf-8");
    fastify.decorateReply("html", html.default(indexHtml));
    async function loadClient() {
        const ssrManifest = utils.resolve(clientDist, ".vite", "ssr-manifest.json");
        const serverInput = utils.resolve(serverDist, "index.js");
        const module = await import(serverInput);
        const client$1 = client.default(module);
        return { client: client$1, ssrManifest };
    }
    return client$1;
}

exports.default = production;
