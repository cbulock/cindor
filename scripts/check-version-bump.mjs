import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const versionFiles = [
  "package.json",
  "package-lock.json",
  "apps/docs/package.json",
  "packages/core/package.json",
  "packages/react/package.json",
  "packages/vue/package.json"
];

const exemptNonVersionFiles = [
  ".github/workflows/create-release.yml",
  ".github/workflows/publish-packages.yml",
  ".github/workflows/version-bump.yml",
  "scripts/check-version-bump.mjs"
];

const workspacePackageFiles = [
  "package.json",
  "apps/docs/package.json",
  "packages/core/package.json",
  "packages/react/package.json",
  "packages/vue/package.json"
];

const baseRef = process.argv[2] ?? process.env.VERSION_CHECK_BASE;
const headRef = process.argv[3] ?? process.env.VERSION_CHECK_HEAD;

if (!baseRef) {
  fail("Missing base ref. Pass a git ref as the first argument or set VERSION_CHECK_BASE.");
}

const changedFiles = getChangedFiles(baseRef, headRef);
const changedNonVersionFiles = changedFiles.filter(
  (file) => !versionFiles.includes(file) && !exemptNonVersionFiles.includes(file)
);

if (changedNonVersionFiles.length === 0) {
  console.log("No non-version files changed; skipping version bump enforcement.");
  process.exit(0);
}

const changedVersionFiles = versionFiles.filter((file) => changedFiles.includes(file));
const missingVersionFiles = versionFiles.filter((file) => !changedVersionFiles.includes(file));

if (missingVersionFiles.length > 0) {
  fail(
    [
      "Detected non-version changes without a full version bump.",
      `Changed non-version files: ${changedNonVersionFiles.join(", ")}`,
      `Missing version updates: ${missingVersionFiles.join(", ")}`
    ].join("\n")
  );
}

const currentRootVersion = readJson("package.json").version;
const baseRootVersion = readGitJson(baseRef, "package.json").version;

if (compareVersions(currentRootVersion, baseRootVersion) <= 0) {
  fail(`Root package version must increase. Base=${baseRootVersion}, current=${currentRootVersion}.`);
}

for (const packageFile of workspacePackageFiles) {
  const manifest = readJson(packageFile);

  if (manifest.version !== currentRootVersion) {
    fail(`${packageFile} must use version ${currentRootVersion}, found ${manifest.version}.`);
  }
}

assertDependencyVersion("apps/docs/package.json", "cindor-ui-core", currentRootVersion);
assertDependencyVersion("packages/react/package.json", "cindor-ui-core", currentRootVersion);
assertDependencyVersion("packages/vue/package.json", "cindor-ui-core", currentRootVersion);

console.log(`Version bump check passed for ${currentRootVersion}.`);

function assertDependencyVersion(packageFile, dependencyName, expectedVersion) {
  const manifest = readJson(packageFile);
  const dependencyVersion = manifest.dependencies?.[dependencyName];

  if (dependencyVersion !== expectedVersion) {
    fail(`${packageFile} must depend on ${dependencyName}@${expectedVersion}, found ${dependencyVersion ?? "missing"}.`);
  }
}

function getChangedFiles(base, head) {
  const args = ["diff", "--name-only", "--diff-filter=ACDMRTUXB", base];

  if (head && !isZeroSha(head)) {
    args.push(head);
  }

  return execFileSync("git", args, { encoding: "utf8" })
    .split(/\r?\n/)
    .map((file) => file.trim())
    .filter(Boolean);
}

function readJson(filePath) {
  return JSON.parse(readFileSync(resolve(filePath), "utf8"));
}

function readGitJson(ref, filePath) {
  return JSON.parse(execFileSync("git", ["show", `${ref}:${toGitPath(filePath)}`], { encoding: "utf8" }));
}

function toGitPath(filePath) {
  return filePath.replaceAll("\\", "/");
}

function compareVersions(left, right) {
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

function parseVersion(version) {
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

function isZeroSha(value) {
  return /^0+$/.test(value);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
