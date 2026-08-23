import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

type PackageManifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  name: string;
  private?: boolean;
  version?: string;
};

type ReleasePleaseConfig = {
  packages: Record<string, { "release-type": string }>;
  plugins?: Array<{
    components?: string[];
    groupName?: string;
    type: string;
  }>;
};

const repoRoot = resolve(import.meta.dirname, "..");
const packageJsonSections = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"] as const;
const exactVersionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

describe("release-please config", () => {
  it("manages every workspace consumer with exact internal dependency pins", () => {
    const manifests = getWorkspaceManifests();
    const releasePleaseConfig = readJson<ReleasePleaseConfig>("release-please-config.json");
    const managedPackagePaths = new Set(Object.keys(releasePleaseConfig.packages));
    const linkedVersionComponents = new Set(
      releasePleaseConfig.plugins
        ?.filter((plugin) => plugin.type === "linked-versions")
        .flatMap((plugin) => plugin.components ?? []) ?? []
    );
    const workspacePackageNames = new Set(manifests.map(({ manifest }) => manifest.name));

    const exactInternalConsumers = manifests.filter(({ manifest }) =>
      packageJsonSections.some((section) =>
        Object.entries(manifest[section] ?? {}).some(
          ([dependencyName, dependencyVersion]) =>
            workspacePackageNames.has(dependencyName) && exactVersionPattern.test(dependencyVersion)
        )
      )
    );

    expect(exactInternalConsumers.map(({ packagePath }) => packagePath).sort()).toEqual([
      "apps/docs/package.json",
      "packages/react/package.json",
      "packages/vue/package.json"
    ]);

    for (const { packagePath } of exactInternalConsumers) {
      const workspacePath = packagePath.replace(/\/package\.json$/, "");
      expect(managedPackagePaths.has(workspacePath), `${workspacePath} must be managed by release-please`).toBe(true);
    }

    for (const { manifest, packagePath } of exactInternalConsumers) {
      expect(linkedVersionComponents.has(manifest.name), `${packagePath} must participate in linked versions`).toBe(true);
    }
  });
});

function getWorkspaceManifests() {
  const packagePaths = ["apps", "packages"].flatMap((workspaceRoot) =>
    readdirSync(resolve(repoRoot, workspaceRoot), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `${workspaceRoot}/${entry.name}/package.json`)
  );

  return packagePaths.map((packagePath) => ({
    packagePath,
    manifest: readJson<PackageManifest>(packagePath)
  }));
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(join(repoRoot, relativePath), "utf8")) as T;
}
