import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

type WorkspaceManifest = {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

type RootManifest = {
  workspaces?: string[] | { packages?: string[] };
};

type ReleasePleaseConfig = {
  packages: Record<string, unknown>;
  plugins: Array<{
    type?: string;
    components?: string[];
  }>;
};

type ReleasePleaseManifest = Record<string, string>;

type WorkspacePackage = {
  packageDir: string;
  packagePath: string;
  manifest: WorkspaceManifest;
};

describe("release-please workspace coverage", () => {
  it("tracks every workspace package that pins another workspace package by exact version", () => {
    const workspacePackages = getWorkspacePackages();
    const workspacePackageNames = new Set(workspacePackages.map(({ manifest }) => manifest.name));
    const releasePleaseConfig = readJson<ReleasePleaseConfig>("release-please-config.json");
    const releasePleaseManifest = readJson<ReleasePleaseManifest>(".release-please-manifest.json");
    const linkedVersionsPlugin = releasePleaseConfig.plugins.find((plugin) => plugin.type === "linked-versions");
    const managedPackagePaths = new Set(Object.keys(releasePleaseConfig.packages));
    const linkedComponents = new Set(linkedVersionsPlugin?.components ?? []);

    const exactInternalConsumers = workspacePackages.filter(({ manifest }) =>
      getInternalDependencyEntries(manifest, workspacePackageNames).some(({ version }) => isExactVersion(version))
    );

    for (const { packageDir, manifest } of exactInternalConsumers) {
      expect(managedPackagePaths.has(packageDir)).toBe(true);
      expect(releasePleaseManifest[packageDir]).toBe(manifest.version);
      expect(linkedComponents.has(manifest.name)).toBe(true);
    }
  });
});

function getWorkspacePackages(): WorkspacePackage[] {
  const rootManifest = readJson<RootManifest>("package.json");
  const workspacePatterns = Array.isArray(rootManifest.workspaces)
    ? rootManifest.workspaces
    : rootManifest.workspaces?.packages ?? [];

  return workspacePatterns
    .flatMap((pattern: string) => expandWorkspacePattern(pattern))
    .map((packagePath: string) => ({
      packageDir: packagePath.replace(/\/package\.json$/, ""),
      packagePath,
      manifest: readJson<WorkspaceManifest>(packagePath)
    }));
}

function expandWorkspacePattern(pattern: string): string[] {
  if (!pattern.endsWith("/*")) {
    return [join(pattern, "package.json").replaceAll("\\", "/")];
  }

  const directory = pattern.slice(0, -2);

  return readdirSync(resolve(directory), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(directory, entry.name, "package.json").replaceAll("\\", "/"));
}

function getInternalDependencyEntries(
  manifest: WorkspaceManifest,
  workspacePackageNames: Set<string>
) {
  return ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"].flatMap((fieldName) =>
    Object.entries(manifest[fieldName as keyof typeof manifest] ?? {})
      .filter(([dependencyName]) => workspacePackageNames.has(dependencyName))
      .map(([dependencyName, version]) => ({
        dependencyName,
        version
      }))
  );
}

function isExactVersion(version: string) {
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version);
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(path), "utf8")) as T;
}
