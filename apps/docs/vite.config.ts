import { resolve } from "node:path";
import process from "node:process";

import { defineConfig } from "vite";
import { docsRouteComponentSlugs } from "./src/route-registration-data";

const configuredBasePath = process.env.DOCS_BASE_PATH?.trim();
const docsBasePath = configuredBasePath
  ? configuredBasePath.endsWith("/")
    ? configuredBasePath
    : `${configuredBasePath}/`
  : "/";
const docsRouteComponentSet = new Set<string>(docsRouteComponentSlugs as readonly string[]);

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
        find: /^cindor-ui-core\/components\/(.*)$/,
        replacement: resolve(__dirname, "../../packages/core/src/components/$1")
      },
      {
        find: "cindor-ui-core",
        replacement: resolve(__dirname, "../../packages/core/src/index.ts")
      }
    ]
  },
  build: {
    emptyOutDir: true,
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/lit/") || id.includes("/node_modules/@lit/")) {
            return "vendor-core";
          }

          if (id.includes("/node_modules/@floating-ui/")) {
            return "vendor-floating-ui";
          }

          if (id.includes("/node_modules/highlight.js/")) {
            return "vendor-highlight";
          }

          if (id.includes("/node_modules/lucide/")) {
            return "vendor-lucide";
          }

          if (id.includes("/node_modules/")) {
            return "vendor-core";
          }

          if (id.includes("/packages/core/component-docs.json")) {
            return "component-docs";
          }

          if (id.includes("/packages/core/src/components/")) {
            const componentMatch = id.match(/\/packages\/core\/src\/components\/([^/]+)\//);
            const componentSlug = componentMatch?.[1];

            if (componentSlug && docsRouteComponentSet.has(componentSlug)) {
              return "docs-route-components";
            }
          }

          return undefined;
        }
      }
    }
  }
});
