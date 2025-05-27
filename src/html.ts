import { Readable } from "node:stream";

import { renderSSRHead } from "@unhead/ssr";
import { uneval } from "devalue";
import { defaultsDeep } from "lodash-es";
import { createServerHead } from "unhead";

import createTemplateFunction from "./template";
import { generateStream } from "./utils-node";

import type { Head } from "@unhead/schema";
import type { FastifyReply } from "fastify";
import type { RenderResponse } from "./render";
import type { TemplateOptions } from "./template";

export type HtmlFunc = (renderResponse: RenderResponse) => Promise<void>;

export default function createHtmlFunction(
  source: string,
  options?: TemplateOptions
): HtmlFunc {
  const [headSource, footerSource] = source.split("<!-- element -->");
  // .replace(/<script[^>]+type="module"[^>]+>.*?<\/script>/g, '')
  // .split('<!-- element -->')
  const headTemplate = createTemplateFunction(headSource, options);
  const footerTemplate = createTemplateFunction(footerSource, options);

  return async function (
    this: FastifyReply,
    { ctx, body, stream, preloadLinks }
  ) {
    let head: Head = {};
    const unhead = createServerHead();

    if (ctx.head) {
      if (typeof ctx.head === "function") {
        head = defaultsDeep({}, await ctx.head(), { ...ctx.head });
      } else {
        head = ctx.head;
      }

      unhead.push(head);

      delete ctx.head;
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
