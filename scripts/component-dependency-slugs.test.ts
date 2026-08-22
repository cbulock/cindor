import fs from "node:fs";
import path from "node:path";

import { componentCatalog } from "../apps/docs/src/catalog.js";
import { componentDependencySlugs } from "../apps/docs/src/route-registration-data.js";

const componentsRoot = path.join(import.meta.dirname, "..", "packages", "core", "src", "components");

function collectComponentFiles(root: string): string[] {
  const files: string[] = [];

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectComponentFiles(fullPath));
      continue;
    }

    if (
      entry.isFile() &&
      /^cindor-.*\.ts$/.test(entry.name) &&
      !entry.name.endsWith(".stories.ts") &&
      !entry.name.endsWith(".test.ts")
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

describe("componentDependencySlugs", () => {
  it("matches direct custom-element usage in component templates", () => {
    const previewableComponentSlugSet = new Set(componentCatalog.map(({ slug }) => slug));
    const detectedDependencies = Object.fromEntries(
      collectComponentFiles(componentsRoot)
        .map((filePath) => {
          const relativePath = path.relative(componentsRoot, filePath).replaceAll(path.sep, "/");
          const match = relativePath.match(/^([^/]+)\/cindor-\1\.ts$/);

          if (!match) {
            return null;
          }

          const slug = match[1];
          if (!previewableComponentSlugSet.has(slug)) {
            return null;
          }

          const source = fs.readFileSync(filePath, "utf8");
          const dependencies = Array.from(new Set(Array.from(source.matchAll(/<\s*(cindor-[a-z0-9-]+)/g), (result) => result[1])))
            .filter((tagName) => tagName !== `cindor-${slug}`)
            .map((tagName) => tagName.replace(/^cindor-/, ""))
            .sort();

          return dependencies.length > 0 ? [slug, dependencies] : null;
        })
        .filter((entry): entry is [string, string[]] => entry !== null)
        .sort(([leftSlug], [rightSlug]) => leftSlug.localeCompare(rightSlug))
    );

    expect(componentDependencySlugs).toEqual(detectedDependencies);
  });
});
