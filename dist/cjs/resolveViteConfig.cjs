'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var process = require('node:process');
var node_url = require('node:url');

async function resolveViteConfig(configFile) {
    const { resolveConfig } = await import('vite');
    const command = process.env.NODE_ENV === "development" ? "serve" : "build";
    const mode = process.env.NODE_ENV === "development" ? "development" : "production";
    const isPreview = false;
    const config = await resolveConfig({
        configFile,
    }, command, mode, process.env.NODE_ENV === "development" ? "development" : "production", isPreview);
    let { default: userConfig } = await import(node_url.pathToFileURL(configFile).href);
    if (typeof userConfig === "function") {
        userConfig = userConfig({
            command,
            mode,
            isSsrBuild: true,
            isPreview,
        });
    }
    return Object.assign(userConfig, {
        root: config.root,
        mode,
        build: {
            assetsDir: config.build.assetsDir,
            outDir: config.build.outDir,
        },
    });
}

exports.default = resolveViteConfig;
