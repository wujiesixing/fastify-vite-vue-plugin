import { omit } from 'lodash-es';

function createRoute(fastify, route, handler) {
    fastify.get(route.path, {
        async onRequest(request, reply) {
            if (route.redirect) {
                reply.code(302).redirect(route.redirect);
                return;
            }
            request.ctx = {
                ...route.render,
                ...omit(route, ["render"]),
                hostname: request.hostname,
                url: request.url,
                firstRender: true,
                state: null,
                data: [],
            };
        },
        handler,
    });
}
function createRouteHandler() {
    return async function (request, reply) {
        reply.html(await reply.render(request));
        return reply;
    };
}

export { createRoute, createRouteHandler };
