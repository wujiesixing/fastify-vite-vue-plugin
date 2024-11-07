import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import del from "rollup-plugin-delete";

export default defineConfig({
  input: "src/index.ts",
  output: [
    {
      dir: "dist",
      entryFileNames: "esm/[name].js",
      exports: "named",
      format: "esm",
      preserveModules: true,
      externalLiveBindings: false,
      freeze: false,
      sourcemap: false,
    },
    {
      dir: "dist",
      entryFileNames: `cjs/[name].cjs`,
      exports: "named",
      format: "cjs",
      preserveModules: true,
      externalLiveBindings: false,
      freeze: false,
      sourcemap: false,
    },
  ],
  plugins: [
    del({ targets: "dist/*" }),
    typescript({
      tsconfig: "tsconfig.json",
    }),
  ],
});
