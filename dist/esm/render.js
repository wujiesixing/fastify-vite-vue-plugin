import { renderToNodeStream, renderToString } from 'vue/server-renderer';

async function createRenderFunction({ create, }) {
    return async function (request) {
        let stream = null;
        let body = null;
        if (!request.ctx?.csr) {
            const { app, ctx } = await create(request.ctx, request.url);
            if (request.ctx?.stream) {
                stream = renderToNodeStream(app, ctx);
            }
            else {
                body = await renderToString(app, ctx);
            }
        }
        return { ctx: request.ctx, body, stream };
    };
}

export { createRenderFunction as default };
