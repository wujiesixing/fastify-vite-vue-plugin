import { renderToNodeStream, renderToString } from 'vue/server-renderer';
import { basename } from 'path';

async function createRenderFunction({ create, manifest, }) {
    return async function (request) {
        let stream = null;
        let body = null;
        let preloadLinks = null;
        if (!request.ctx?.csr) {
            const { app, ctx, preloadLinks: pl, } = await create(request.ctx, request.url, manifest);
            if (pl) {
                preloadLinks = pl;
            }
            if (request.ctx?.stream) {
                stream = renderToNodeStream(app, ctx);
            }
            else {
                body = await renderToString(app, ctx);
            }
        }
        return { ctx: request.ctx, body, stream, preloadLinks };
    };
}
function renderPreloadLinks(modules, manifest) {
    let links = "";
    const seen = new Set();
    modules.forEach((id) => {
        const files = manifest[id];
        if (files) {
            files.forEach((file) => {
                if (!seen.has(file)) {
                    seen.add(file);
                    const filename = basename(file);
                    if (manifest[filename]) {
                        for (const depFile of manifest[filename]) {
                            links += renderPreloadLink(depFile);
                            seen.add(depFile);
                        }
                    }
                    links += renderPreloadLink(file);
                }
            });
        }
    });
    return links;
}
function renderPreloadLink(file) {
    if (file.endsWith(".js")) {
        return `<link rel="modulepreload" crossorigin href="${file}">`;
    }
    else if (file.endsWith(".css")) {
        return `<link rel="stylesheet" href="${file}">`;
    }
    else if (file.endsWith(".otf")) {
        return ` <link rel="preload" href="${file}" as="font" type="font/opentype" crossorigin>`;
    }
    else if (file.endsWith(".woff")) {
        return ` <link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`;
    }
    else if (file.endsWith(".woff2")) {
        return ` <link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`;
    }
    else if (file.endsWith(".gif")) {
        return ` <link rel="preload" href="${file}" as="image" type="image/gif">`;
    }
    else if (file.endsWith(".jpg") || file.endsWith(".jpeg")) {
        return ` <link rel="preload" href="${file}" as="image" type="image/jpeg">`;
    }
    else if (file.endsWith(".png")) {
        return ` <link rel="preload" href="${file}" as="image" type="image/png">`;
    }
    else if (file.endsWith(".svg")) {
        return ` <link rel="preload" href="${file}" as="image" type="image/svg">`;
    }
    else {
        // TODO
        return "";
    }
}

export { createRenderFunction as default, renderPreloadLinks };
