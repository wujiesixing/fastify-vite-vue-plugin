'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var plugin = require('./plugin.cjs');
var routes = require('./routes.cjs');
var template = require('./template.cjs');



exports.default = plugin.default;
exports.flatRoutes = routes.flatRoutes;
exports.createTemplateFunction = template.default;
