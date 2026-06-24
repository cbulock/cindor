import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: {
    cjsReexport: false
  },
  deps: {
    neverBundle: [
      "vue",
      "cindor-ui-core",
      "cindor-ui-core/register"
    ]
  },
  outExtensions: ({ format }) => ({
    js: format === "cjs" ? ".cjs" : ".js",
    dts: ".d.ts"
  })
});
