'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function prepareClient({ routes, create, ...others }) {
    return { routes, create, ...others };
}

exports.default = prepareClient;
