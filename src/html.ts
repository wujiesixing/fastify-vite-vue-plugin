import { Readable } from "node:stream";

import { renderSSRHead } from "@unhead/ssr";
import { uneval } from "devalue";
import { createServerHead } from "unhead";

import createTemplateFunction from "./template";
import { generateStream } from "./utils-node";

import type { FastifyReply } from "fastify";
import { RenderResponse } from "./render";

export type HtmlFunc = (renderResponse: RenderResponse) => Promise<void>;

export default function createHtmlFunction(source: string): HtmlFunc {
  const [headSource, footerSource] = source.split("<!-- element -->");
  // .replace(/<script[^>]+type="module"[^>]+>.*?<\/script>/g, '')
  // .split('<!-- element -->')
  const headTemplate = createTemplateFunction(headSource);
  const footerTemplate = createTemplateFunction(footerSource);

  return async function (
    this: FastifyReply,
    { ctx, body, stream, preloadLinks }
  ) {
    const head = createServerHead();

    if (ctx.head) {
      head.push(ctx.head);
    }

    const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } =
      await renderSSRHead(head);

    const readable = Readable.from(
      generateStream(
        headTemplate({
          htmlAttrs,
          headTags,
          bodyAttrs,
          bodyTagsOpen,
          hydration: `<script>window.__INITIAL_CONTEXT__=${uneval(
            ctx
          )};</script>`,
          preloadLinks,
        }),
        body ?? stream ?? "",
        footerTemplate({
          bodyTags,
        })
      )
    );

    this.type("text/html;charset=utf-8");
    this.send(readable);
  };
}
