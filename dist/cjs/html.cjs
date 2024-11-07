'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var node_stream = require('node:stream');
var ssr = require('@unhead/ssr');
var devalue = require('devalue');
var unhead = require('unhead');
var template = require('./template.cjs');
var utils = require('./utils.cjs');

function createHtmlFunction(source) {
    const [headSource, footerSource] = source.split("<!-- element -->");
    // .replace(/<script[^>]+type="module"[^>]+>.*?<\/script>/g, '')
    // .split('<!-- element -->')
    const headTemplate = template.default(headSource);
    const footerTemplate = template.default(footerSource);
    return async function ({ ctx, body, stream, preloadLinks }) {
        const head = unhead.createServerHead();
        if (ctx.head) {
            head.push(ctx.head);
        }
        const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = await ssr.renderSSRHead(head);
        const readable = node_stream.Readable.from(utils.generateStream(headTemplate({
            htmlAttrs,
            headTags,
            bodyAttrs,
            bodyTagsOpen,
            hydration: `<script>window.__INITIAL_CONTEXT__=${devalue.uneval(ctx)};</script>`,
            preloadLinks,
        }), body ?? stream ?? "", footerTemplate({
            bodyTags,
        })));
        this.type("text/html;charset=utf-8");
        this.send(readable);
    };
}

exports.default = createHtmlFunction;
