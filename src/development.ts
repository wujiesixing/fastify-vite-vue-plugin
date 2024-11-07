import { readFile } from "node:fs/promises";

import middie from "@fastify/middie";

import prepareClient from "./client";
import createHtmlFunction from "./html";
import createRenderFunction from "./render";
import resolveViteConfig from "./resolveViteConfig";
import { resolve } from "./utils";

import type { FastifyInstance } from "fastify";
import type { Options } from "./plugin";

export default async function development(
  fastify: FastifyInstance,
  options: Options
) {
  const { createServer, createServerModuleRunner, mergeConfig } = await import(
    "vite"
  );

  const viteConfig = await resolveViteConfig(options.server.viteConfig);

  const config = mergeConfig(
    {
      root: options.root,
      configFile: false,
      server: { middlewareMode: true },
      appType: "custom",
    },
    viteConfig
  );

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
