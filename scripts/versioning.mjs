import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export const versionFiles = [
  "package.json",
  "package-lock.json",
  "apps/docs/package.json",
  "packages/core/package.json",
  "packages/react/package.json",
  "packages/vue/package.json"
];

export const exemptNonVersionFiles = [
  ".github/workflows/create-release.yml",
  ".github/workflows/publish-packages.yml",
  ".github/workflows/version-bump.yml",
  "packages/core/component-docs.json",
  "packages/core/custom-elements.json",
  "scripts/auto-version-bump.mjs",
  "scripts/check-version-bump.mjs",
  "scripts/versioning.mjs"
];

export const workspacePackageFiles = [
  "package.json",
  "apps/docs/package.json",
  "packages/core/package.json",
  "packages/react/package.json",
  "packages/vue/package.json"
];

export function getChangedFiles(base, head) {
  const args = ["diff", "--name-only", "--diff-filter=ACDMRTUXB", base];

  if (head && !isZeroSha(head)) {
    args.push(head);
  }

  return execFileSync("git", args, { encoding: "utf8" })
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter(Boolean);
}

export function getChangedNonVersionFiles(changedFiles) {
  return changedFiles.filter((file) => !versionFiles.includes(file) && !exemptNonVersionFiles.includes(file));
}

export function readJson(filePath) {
  return JSON.parse(readFileSync(resolve(filePath), "utf8"));
}

export function writeJson(filePath, value) {
  writeFileSync(resolve(filePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function readGitJson(ref, filePath) {
  return JSON.parse(execFileSync("git", ["show", `${ref}:${toGitPath(filePath)}`], { encoding: "utf8" }));
}

export function toGitPath(filePath) {
  return filePath.replaceAll("\\", "/");
}

export function compareVersions(left, right) {
  const leftVersion = parseVersion(left);
  const rightVersion = parseVersion(right);

  for (const key of ["major", "minor", "patch"]) {
    if (leftVersion[key] !== rightVersion[key]) {
      return leftVersion[key] - rightVersion[key];
    }
  }

  if (leftVersion.prerelease === rightVersion.prerelease) {
    return 0;
  }

  if (!leftVersion.prerelease) {
    return 1;
  }

  if (!rightVersion.prerelease) {
    return -1;
  }

  return leftVersion.prerelease.localeCompare(rightVersion.prerelease);
}

export function incrementVersion(version, level = "patch") {
  const parsed = parseVersion(version);

  if (level === "major") {
    parsed.major += 1;
    parsed.minor = 0;
    parsed.patch = 0;
  } else if (level === "minor") {
    parsed.minor += 1;
    parsed.patch = 0;
  } else {
    parsed.patch += 1;
  }

  return `${parsed.major}.${parsed.minor}.${parsed.patch}`;
}

export function syncWorkspaceVersions(version) {
  for (const packageFile of workspacePackageFiles) {
    const manifest = readJson(packageFile);
    manifest.version = version;

    if (packageFile === "apps/docs/package.json" || packageFile === "packages/react/package.json" || packageFile === "packages/vue/package.json") {
      manifest.dependencies ??= {};
      manifest.dependencies["cindor-ui-core"] = version;
    }

    writeJson(packageFile, manifest);
  }
}

export function getHighestWorkspaceVersion() {
  const versions = [
    ...workspacePackageFiles.map((packageFile) => readJson(packageFile).version),
    readJson("apps/docs/package.json").dependencies?.["cindor-ui-core"],
    readJson("packages/react/package.json").dependencies?.["cindor-ui-core"],
    readJson("packages/vue/package.json").dependencies?.["cindor-ui-core"]
  ].filter(Boolean);

  return versions.sort(compareVersions).at(-1);
}

export function parseVersion(version) {
  const match = /^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(?:-(?<prerelease>.+))?$/.exec(version);

  if (!match?.groups) {
    fail(`Unsupported version format: ${version}`);
  }

  return {
    major: Number(match.groups.major),
    minor: Number(match.groups.minor),
    patch: Number(match.groups.patch),
    prerelease: match.groups.prerelease ?? ""
  };
}

export function isZeroSha(value) {
  return /^0+$/.test(value);
}

export function fail(message) {
  console.error(message);
  process.exit(1);
}
