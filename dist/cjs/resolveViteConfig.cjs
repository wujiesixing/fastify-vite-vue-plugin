'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var process = require('node:process');
var node_url = require('node:url');

async function resolveViteConfig(configFile) {
    const command = process.env.NODE_ENV === "development" ? "serve" : "build";
    const mode = process.env.NODE_ENV === "development" ? "development" : "production";
    let { default: userConfig } = await import(node_url.pathToFileURL(configFile).href);
    if (typeof userConfig === "function") {
        userConfig = userConfig({
            command,
            mode,
            isSsrBuild: true,
            isPreview: false,
        });
    }
    return userConfig;
}

exports.default = resolveViteConfig;
