import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import fastifyStatic from "@fastify/static";

import prepareClient from "./client";
import createHtmlFunction from "./html";
import createRenderFunction from "./render";
import { resolve } from "./utils-node";

import type { FastifyInstance } from "fastify";
import type { Options } from "./plugin";
import type { TemplateOptions } from "./template";

export type Manifest = Record<string, string[]>;

export default async function production(
  fastify: FastifyInstance,
  options: Options
) {
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
  fastify.decorateReply(
    "render",
    await createRenderFunction({ ...client, manifest })
  );

  const indexHtml = await readFile(join(clientDist, "index.html"), "utf-8");
  fastify.decorateReply(
    "html",
    createHtmlFunction(indexHtml, options.template as TemplateOptions)
  );

  async function loadClient() {
    const ssrManifest = join(clientDist, ".vite", "ssr-manifest.json");

    const manifest: Manifest = JSON.parse(readFileSync(ssrManifest, "utf-8"));

    const serverInput = join(serverDist, "index.js");

    const module = await import(pathToFileURL(serverInput).href);

    const client = options.prepareClient
      ? await options.prepareClient(module)
      : prepareClient(module);

    return { client, manifest };
  }

  return client;
}
