'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var node_stream = require('node:stream');
var ssr = require('@unhead/ssr');
var devalue = require('devalue');
var unhead = require('unhead');
var lodashEs = require('lodash-es');
var template = require('./template.cjs');
var utilsNode = require('./utils-node.cjs');

function createHtmlFunction(source, options) {
    const [headSource, footerSource] = source.split("<!-- element -->");
    // .replace(/<script[^>]+type="module"[^>]+>.*?<\/script>/g, '')
    // .split('<!-- element -->')
    const headTemplate = template.default(headSource, options);
    const footerTemplate = template.default(footerSource, options);
    return async function ({ ctx, body, stream, preloadLinks }) {
        let head = {};
        const unhead$1 = unhead.createServerHead();
        if (ctx.head) {
            if (typeof ctx.head === "function") {
                head = lodashEs.defaultsDeep({}, await ctx.head(), { ...ctx.head });
            }
            else {
                head = ctx.head;
            }
            unhead$1.push(head);
        }
        const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = await ssr.renderSSRHead(unhead$1);
        const readable = node_stream.Readable.from(utilsNode.generateStream(headTemplate({
            htmlAttrs,
            headTags,
            bodyAttrs,
            bodyTagsOpen,
            hydration: `<script>window.__INITIAL_CONTEXT__=${devalue.uneval({
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

exports.default = createHtmlFunction;
