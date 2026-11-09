import assert from "node:assert/strict";
import { cp, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { build } from "esbuild";

const root = path.resolve(import.meta.dirname, "..");
const consumer = path.join(root, ".tmp/selective-consumer");
await mkdir(path.join(consumer, "node_modules"), { recursive: true });
for (const name of ["core", "react", "vue"]) {
  const dest = path.join(consumer, "node_modules", `cindor-ui-${name}`);
  await mkdir(dest, { recursive: true });
  await cp(path.join(root, "packages", name, "dist"), path.join(dest, "dist"), { recursive: true });
  await cp(path.join(root, "packages", name, "package.json"), path.join(dest, "package.json"));
}
const baseline = process.argv.includes("--baseline");
for (const name of ["core", "react", "vue"]) {
  const specifier = `cindor-ui-${name}${baseline || name === "core" ? "" : "/components/button"}`;
  const result = await build({
    stdin: { contents: `export { CindorButton } from '${specifier}';`, resolveDir: consumer },
    bundle: true, minify: true, format: "esm", platform: "browser", write: false,
    metafile: true, external: ["react", "vue"], tsconfigRaw: {}
  });
  const bytes = gzipSync(result.outputFiles[0].contents).byteLength;
  console.log(`${name} button: ${bytes} gzip bytes`);
  if (!baseline) {
    assert.ok(bytes < 20000, `${name} button must stay below 20 KB gzip`);
    assert.ok(!result.outputFiles[0].text.includes("cindor-data-table"), "unrelated data-table excluded");
    assert.ok(!Object.values(result.metafile.outputs).some(output => Object.entries(output.inputs).some(([file, usage]) => usage.bytesInOutput > 0 && /highlight.js|lucide|floating-ui/.test(file))), "heavy dependencies excluded");
  }
}
const icon = await build({
  stdin: { contents: "export { CindorIcon } from 'cindor-ui-core';", resolveDir: consumer },
  bundle: true, splitting: true, minify: true, format: "esm", platform: "browser", write: false,
  outdir: path.join(consumer, "icon"), metafile: true, tsconfigRaw: {}
});
const entry = icon.outputFiles.find(file => file.path.endsWith("stdin.js"));
console.log(`icon entry: ${gzipSync(entry.contents).byteLength} gzip bytes`);
if (!baseline) {
  assert.ok(gzipSync(entry.contents).byteLength < 20000, "icon entry must exclude the full catalog");
  assert.ok(icon.outputFiles.length > 1, "arbitrary icon catalog must be lazy loaded");
}
await writeFile(path.join(consumer, "bundle-evidence.json"), JSON.stringify(icon.metafile, null, 2));
