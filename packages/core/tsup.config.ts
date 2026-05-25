import { readdirSync, statSync } from "node:fs";
import { join, posix, relative, sep } from "node:path";

import { defineConfig } from "tsup";

const srcRoot = join(import.meta.dirname, "src");
const componentRoot = join(srcRoot, "components");

export default defineConfig({
  clean: true,
  entry: {
    index: join(srcRoot, "index.ts"),
    register: join(srcRoot, "register.ts"),
    ...getComponentEntries(componentRoot)
  },
  format: ["esm"],
  target: "es2022"
});

function getComponentEntries(directory: string): Record<string, string> {
  const entries: Record<string, string> = {};

  for (const entryPath of walkTypescriptFiles(directory)) {
    const normalizedPath = entryPath.split(sep).join(posix.sep);

    if (
      normalizedPath.endsWith(".stories.ts") ||
      normalizedPath.endsWith(".test.ts") ||
      normalizedPath.endsWith(".d.ts")
    ) {
      continue;
    }

    if (
      !normalizedPath.match(/\/cindor-[^/]+\.ts$/) &&
      !normalizedPath.endsWith("/provider/provider-theme.ts") &&
      !normalizedPath.endsWith("/toast/toast-manager.ts")
    ) {
      continue;
    }

    const relativePath = relative(srcRoot, entryPath).replace(/\.ts$/, "").split(sep).join(posix.sep);
    entries[relativePath] = entryPath;
  }

  return entries;
}

function walkTypescriptFiles(directory: string): string[] {
  const entries: string[] = [];

  for (const name of readdirSync(directory)) {
    const entryPath = join(directory, name);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      entries.push(...walkTypescriptFiles(entryPath));
      continue;
    }

    if (stats.isFile() && entryPath.endsWith(".ts")) {
      entries.push(entryPath);
    }
  }

  return entries;
}
