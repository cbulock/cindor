import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  entry: ["src/index.tsx"],
  format: ["esm", "cjs"],
  dts: {
    cjsReexport: false
  },
  deps: {
    neverBundle: [
      "react",
      "react/jsx-runtime",
      "cindor-ui-core",
      "cindor-ui-core/register"
    ]
  },
  outExtensions: ({ format }) => ({
    js: format === "cjs" ? ".cjs" : ".js",
    dts: ".d.ts"
  })
});
