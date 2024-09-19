import process from 'node:process';
import { pathToFileURL } from 'node:url';

async function resolveViteConfig(configFile) {
    const command = process.env.NODE_ENV === "development" ? "serve" : "build";
    const mode = process.env.NODE_ENV === "development" ? "development" : "production";
    let { default: userConfig } = await import(pathToFileURL(configFile).href);
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

export { resolveViteConfig as default };
