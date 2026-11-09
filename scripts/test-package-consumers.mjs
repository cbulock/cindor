import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const npmCli = process.env.npm_execpath;
const consumerNode = process.env.CINDOR_CONSUMER_NODE || process.execPath;
assert.ok(npmCli, "Run this check using npm run test:packages.");
const temporaryRoot = join(root, ".tmp");
mkdirSync(temporaryRoot, { recursive: true });
const temporaryDirectory = mkdtempSync(join(temporaryRoot, "package-consumers-"));

function npm(args, cwd = root) {
  return execFileSync(process.execPath, [npmCli, ...args], { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

try {
  const tarballs = ["core", "react", "vue"].map((name) => {
    const packed = JSON.parse(npm(["pack", `./packages/${name}`, "--json", "--pack-destination", temporaryDirectory]));
    return join(temporaryDirectory, packed[0].filename);
  });
  const consumer = join(temporaryDirectory, "consumer");
  mkdirSync(consumer);
  const dependencies = Object.fromEntries(["react", "react-dom", "vue", "typescript", "@types/react", "@types/react-dom"].map((name) => [
    name, JSON.parse(readFileSync(join(root, "node_modules", name, "package.json"), "utf8")).version
  ]));
  writeFileSync(join(consumer, "package.json"), JSON.stringify({ private: true, type: "module", dependencies }));
  npm(["install", "--ignore-scripts", "--no-audit", "--no-fund", "--package-lock=false", "--prefer-offline", ...tarballs], consumer);
  assert.ok(realpathSync(join(consumer, "node_modules", "cindor-ui-core")).startsWith(consumer), "Test must use packed packages, not workspace links.");

  for (const [first, entry] of ["require", "import"].flatMap((mode) => ["cindor-ui-core", "cindor-ui-react", "cindor-ui-vue"].map((name) => [mode, name]))) {
    const runtime = `
      import assert from 'node:assert/strict';
      import { createRequire } from 'node:module';
      const require = createRequire(import.meta.url);
      const names = [...new Set([${JSON.stringify(entry)}, 'cindor-ui-core', 'cindor-ui-core/register', 'cindor-ui-core/components/button/cindor-button', 'cindor-ui-react', 'cindor-ui-vue'])];
      const loaded = {};
      for (const name of names) {
        const first = ${JSON.stringify(first)} === 'require' ? require(name) : await import(name);
        const second = ${JSON.stringify(first)} === 'require' ? await import(name) : require(name);
        loaded[name] = first;
        if (name.startsWith('cindor-ui-core')) {
          for (const key of Object.keys(first).filter(key => key !== '__esModule' && key !== 'default')) assert.equal(first[key], second[key], name + ': ' + key + ' must share identity');
        }
        if (name === 'cindor-ui-react' || name === 'cindor-ui-vue') assert.ok(first.CindorButton && second.CindorButton);
      }
      assert.equal(loaded['cindor-ui-core'].CindorButton, loaded['cindor-ui-core/components/button/cindor-button'].CindorButton);
      assert.equal(customElements.get('cindor-button'), loaded['cindor-ui-core'].CindorButton);
      loaded['cindor-ui-core/register'].registerCindorUi();
      console.log(${JSON.stringify(`${first}-first ${entry}`)} + ' consumer passed on ' + process.version);
    `;
    const runtimePath = join(consumer, `${first}-${entry}.mjs`);
    writeFileSync(runtimePath, runtime);
    process.stdout.write(execFileSync(consumerNode, [runtimePath], { cwd: consumer, encoding: "utf8" }));
  }

  const typeSource = `
    import { CindorButton as CoreButton } from 'cindor-ui-core';
    import { CindorButton as DirectButton } from 'cindor-ui-core/components/button/cindor-button';
    import { CindorButton as ReactButton } from 'cindor-ui-react';
    import { CindorButton as VueButton } from 'cindor-ui-vue';
    import type { ComponentProps } from 'react';
    const direct: typeof CoreButton = DirectButton;
    const props: ComponentProps<typeof ReactButton> = { disabled: true };
    void [direct, props, VueButton];
  `;
  writeFileSync(join(consumer, "consumer.mts"), typeSource);
  writeFileSync(join(consumer, "consumer.cts"), typeSource + `
    import core = require('cindor-ui-core');
    import react = require('cindor-ui-react');
    import vue = require('cindor-ui-vue');
    const sameCore: typeof CoreButton = core.CindorButton;
    void [sameCore, react.CindorButton, vue.CindorButton];
  `);
  execFileSync(process.execPath, [join(consumer, "node_modules/typescript/bin/tsc"), "--noEmit", "--strict", "--skipLibCheck", "--target", "ES2022", "--module", "NodeNext", "--moduleResolution", "NodeNext", "consumer.mts", "consumer.cts"], { cwd: consumer, stdio: "inherit" });
  console.log("Packed ESM and CommonJS runtime/type consumers passed.");
} finally {
  assert.equal(dirname(temporaryDirectory), temporaryRoot);
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
