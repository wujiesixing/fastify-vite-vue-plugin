import process from 'node:process';
import { pathToFileURL } from 'node:url';

async function resolveViteConfig(configFile) {
    const { resolveConfig } = await import('vite');
    const command = process.env.NODE_ENV === "development" ? "serve" : "build";
    const mode = process.env.NODE_ENV === "development" ? "development" : "production";
    const isPreview = false;
    const config = await resolveConfig({
        configFile,
    }, command, mode, process.env.NODE_ENV === "development" ? "development" : "production", isPreview);
    let { default: userConfig } = await import(pathToFileURL(configFile).href);
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

export { resolveViteConfig as default };
