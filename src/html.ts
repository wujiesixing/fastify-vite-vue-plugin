import { Readable } from "node:stream";

import { renderSSRHead } from "@unhead/ssr";
import { uneval } from "devalue";
import { createServerHead } from "unhead";

import createTemplateFunction from "./template";
import { generateStream } from "./utils-node";

import type { Head } from "@unhead/schema";
import type { FastifyReply } from "fastify";
import type { RenderResponse } from "./render";

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
    let head: Head = {};
    const unhead = createServerHead();

    if (ctx.head) {
      if (typeof ctx.head === "function") {
        head = await ctx.head();
      } else {
        head = ctx.head;
      }

      unhead.push(head);
    }

    const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } =
      await renderSSRHead(unhead);

    const readable = Readable.from(
      generateStream(
        headTemplate({
          htmlAttrs,
          headTags,
          bodyAttrs,
          bodyTagsOpen,
          hydration: `<script>window.__INITIAL_CONTEXT__=${uneval({
            ...ctx,
            head,
          })};</script>`,
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
