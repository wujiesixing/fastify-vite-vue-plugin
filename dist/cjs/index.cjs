'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plugin = require('./plugin.cjs');
var routes = require('./routes.cjs');



exports.default = plugin.default;
exports.flatRoutes = routes.flatRoutes;
exports.getRoutes = routes.getRoutes;
