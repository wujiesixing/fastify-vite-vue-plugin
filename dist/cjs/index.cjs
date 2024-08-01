'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plugin = require('./plugin.cjs');
var render = require('./render.cjs');
var routes = require('./routes.cjs');



exports.default = plugin.default;
exports.renderPreloadLinks = render.renderPreloadLinks;
exports.flatRoutes = routes.flatRoutes;
