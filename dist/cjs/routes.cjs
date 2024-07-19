'use strict';

var lodashEs = require('lodash-es');
var utilsBrowser = require('./utils-browser.cjs');

function formatPath(path) {
    return path.replace(/\/+/g, "/").replace(/(?!^)\/$/, "");
}
function getFullPath(path, base = "") {
    if (path.startsWith("/")) {
        return formatPath(path);
    }
    return formatPath("/" + base + "/" + path);
}
function getRoutes(array, base) {
    const names = [];
    function _getRoutes(_array, _base) {
        return _array.map((route) => {
            let { path, meta } = route;
            const { component, redirect, children } = route;
            const name = getFullPath(path, _base?.path);
            if (names.includes(name)) {
                throw new Error(`自动生成 name （${name}）失败，请检查路由配置是否正确：${JSON.stringify(route)}`);
            }
            names.push(name);
            path = formatPath(path);
            const provide = lodashEs.defaultsDeep({}, meta?.provide, _base?.meta);
            meta = lodashEs.defaultsDeep({}, lodashEs.omit(meta, ["provide"]), provide);
            if (component && lodashEs.isNil(redirect) && lodashEs.isNil(children)) {
                return {
                    ...route,
                    meta,
                    name,
                    path,
                };
            }
            if (children) {
                return {
                    ...route,
                    children: _getRoutes(children, {
                        path: name,
                        meta: provide,
                    }),
                    meta,
                    name,
                    path,
                };
            }
            if (redirect && lodashEs.isNil(component)) {
                return {
                    ...route,
                    meta,
                    name,
                    path,
                };
            }
            throw new Error(`类型检测不通过：${JSON.stringify(route)}`);
        });
    }
    return utilsBrowser.deepFreeze(_getRoutes(array, base));
}
function flatRoutes(array, base) {
    const paths = [];
    function _flatRoutes(_array, _base) {
        return _array.flatMap((route) => {
            let { meta } = route;
            const { path, component, redirect, children } = route;
            const fullPath = getFullPath(path, _base?.path);
            const provide = lodashEs.defaultsDeep({}, meta?.provide, _base?.meta);
            meta = lodashEs.defaultsDeep({}, lodashEs.omit(meta, ["provide"]), provide);
            let currentRoute = null;
            if (component || redirect) {
                if (paths.includes(fullPath)) {
                    throw new Error(`路由检测重复：${JSON.stringify(route)}`);
                }
                paths.push(fullPath);
                currentRoute = { ...meta, path: fullPath, redirect };
            }
            if (children) {
                return [
                    ...(currentRoute ? [currentRoute] : []),
                    ..._flatRoutes(children, {
                        path: fullPath,
                        meta: provide,
                    }),
                ];
            }
            else {
                return currentRoute ? [currentRoute] : [];
            }
        });
    }
    return utilsBrowser.deepFreeze(_flatRoutes(array, base));
}

exports.flatRoutes = flatRoutes;
exports.getRoutes = getRoutes;
