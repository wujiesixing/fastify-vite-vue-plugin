import { Readable } from 'node:stream';
import { renderSSRHead } from '@unhead/ssr';
import { uneval } from 'devalue';
import { createServerHead } from 'unhead';
import { defaultsDeep } from 'lodash-es';
import createTemplateFunction from './template.js';
import { generateStream } from './utils-node.js';

function createHtmlFunction(source, options) {
    const [headSource, footerSource] = source.split("<!-- element -->");
    // .replace(/<script[^>]+type="module"[^>]+>.*?<\/script>/g, '')
    // .split('<!-- element -->')
    const headTemplate = createTemplateFunction(headSource, options);
    const footerTemplate = createTemplateFunction(footerSource, options);
    return async function ({ ctx, body, stream, preloadLinks }) {
        let head = {};
        const unhead = createServerHead();
        if (ctx.head) {
            if (typeof ctx.head === "function") {
                head = defaultsDeep({}, await ctx.head(), { ...ctx.head });
            }
            else {
                head = ctx.head;
            }
            unhead.push(head);
        }
        const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = await renderSSRHead(unhead);
        const readable = Readable.from(generateStream(headTemplate({
            htmlAttrs,
            headTags,
            bodyAttrs,
            bodyTagsOpen,
            hydration: `<script>window.__INITIAL_CONTEXT__=${uneval({
                ...ctx,
                head,
            })};</script>`,
            preloadLinks,
        }), body ?? stream ?? "", footerTemplate({
            bodyTags,
        })));
        this.type("text/html;charset=utf-8");
        this.send(readable);
    };
}

export { createHtmlFunction as default };
