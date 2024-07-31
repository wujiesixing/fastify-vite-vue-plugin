import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";

import fastifyStatic from "@fastify/static";

import prepareClient from "./client";
import createHtmlFunction from "./html";
import createRenderFunction from "./render";
import { resolve } from "./utils-node";

import type { FastifyInstance } from "fastify";
import type { Manifest } from "./client";
import type { Options } from "./plugin";
import type { ViteConfig } from "./resolveViteConfig";

export default async function production(
  fastify: FastifyInstance,
  options: Options,
  viteConfig: ViteConfig
) {
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

  const { client, manifest } = await loadClient();
  fastify.decorateReply(
    "render",
    await createRenderFunction({ ...client, manifest })
  );

  const indexHtml = await readFile(resolve("index.html"), "utf-8");
  fastify.decorateReply("html", createHtmlFunction(indexHtml));

  async function loadClient() {
    const ssrManifest = resolve(clientDist, ".vite", "ssr-manifest.json");

    const manifest: Manifest = JSON.parse(readFileSync(ssrManifest, "utf-8"));

    const serverInput = resolve(serverDist, "index.js");

    const module = await import(serverInput);

    const client = options.prepareClient
      ? await options.prepareClient(module)
      : prepareClient(module);

    return { client, manifest };
  }

  return client;
}
