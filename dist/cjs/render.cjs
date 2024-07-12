'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var serverRenderer = require('vue/server-renderer');

async function createRenderFunction({ create, }) {
    return async function (request) {
        let stream = null;
        let body = null;
        if (!request.ctx?.csr) {
            const { app, ctx } = await create(request.ctx, request.url);
            if (request.ctx?.stream) {
                stream = serverRenderer.renderToNodeStream(app, ctx);
            }
            else {
                body = await serverRenderer.renderToString(app, ctx);
            }
        }
        return { ctx: request.ctx, body, stream };
    };
}

exports.default = createRenderFunction;
