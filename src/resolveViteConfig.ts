import process from "node:process";
import { pathToFileURL } from "node:url";

import type { UserConfig } from "vite";

export default async function resolveViteConfig(
  configFile: string
): Promise<UserConfig> {
  const command = process.env.NODE_ENV === "development" ? "serve" : "build";
  const mode =
    process.env.NODE_ENV === "development" ? "development" : "production";

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
