'use strict';

var lodashEs = require('lodash-es');

function createRoute(fastify, route, routes, handler) {
    fastify.get(route.path, {
        async onRequest(request, reply) {
            if (route.redirect) {
                reply.code(302).redirect(route.redirect);
                return;
            }
            request.ctx = {
                ...route.render,
                ...lodashEs.omit(route, ["render"]),
                hostname: request.hostname,
                routes: routes(),
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

exports.createRoute = createRoute;
exports.createRouteHandler = createRouteHandler;
