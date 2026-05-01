import { resolve } from "node:path";
import process from "node:process";

import { defineConfig } from "vite";

const configuredBasePath = process.env.DOCS_BASE_PATH?.trim();
const docsBasePath = configuredBasePath
  ? configuredBasePath.endsWith("/")
    ? configuredBasePath
    : `${configuredBasePath}/`
  : "/";

export default defineConfig({
  base: docsBasePath,
  resolve: {
    alias: [
      {
        find: "cindor-ui-core/register",
        replacement: resolve(__dirname, "../../packages/core/src/register.ts")
      },
      {
        find: "cindor-ui-core/styles.css",
        replacement: resolve(__dirname, "../../packages/core/src/styles.css")
      },
      {
        find: "cindor-ui-core",
        replacement: resolve(__dirname, "../../packages/core/src/index.ts")
      }
    ]
  },
  build: {
    emptyOutDir: true,
    outDir: "dist"
  }
});
