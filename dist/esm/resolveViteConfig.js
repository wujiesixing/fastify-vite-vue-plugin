import process from 'node:process';
import { resolveConfig } from 'vite';

async function resolveViteConfig(configFile) {
    const command = process.env.NODE_ENV === "development" ? "serve" : "build";
    const mode = process.env.NODE_ENV === "development" ? "development" : "production";
    const isPreview = false;
    const config = await resolveConfig({
        configFile,
    }, command, mode, process.env.NODE_ENV === "development" ? "development" : "production", isPreview);
    if (process.platform === "win32") {
        configFile = `file://${configFile}`;
    }
    let { default: userConfig } = await import(configFile);
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
