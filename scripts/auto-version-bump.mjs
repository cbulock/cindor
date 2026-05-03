import { execFileSync } from "node:child_process";
import process from "node:process";

import {
  compareVersions,
  getChangedFiles,
  getChangedNonVersionFiles,
  getHighestWorkspaceVersion,
  incrementVersion,
  readGitJson,
  readJson,
  syncWorkspaceVersions,
  workspacePackageFiles
} from "./versioning.mjs";

const { baseRef, level } = parseArgs(process.argv.slice(2));
const comparisonBase = baseRef ?? detectComparisonBase();

if (!comparisonBase) {
  console.log("Skipping automatic version bump because no comparison base could be determined.");
  process.exit(0);
}

const changedFiles = getChangedFiles(comparisonBase, "HEAD");
const changedNonVersionFiles = getChangedNonVersionFiles(changedFiles);

if (changedNonVersionFiles.length === 0) {
  console.log("No non-version changes detected; skipping automatic version bump.");
  process.exit(0);
}

if (hasExplicitVersionEdits(comparisonBase)) {
  console.log("Detected an existing version change; skipping automatic version bump.");
  process.exit(0);
}

const currentVersion = getHighestWorkspaceVersion();
const nextVersion = incrementVersion(currentVersion, level);

syncWorkspaceVersions(nextVersion);
execFileSync("npm", ["install", "--package-lock-only"], { stdio: "inherit", shell: process.platform === "win32" });

console.error(
  [
    `Applied ${level} version bump to ${nextVersion}.`,
    `Changed source files: ${changedNonVersionFiles.join(", ")}`,
    "Review the updated manifests and package-lock.json, commit them, and push again."
  ].join("\n")
);
process.exit(1);

function parseArgs(args) {
  let baseRef;
  let level = "patch";

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "--base") {
      baseRef = args[index + 1];
      index += 1;
      continue;
    }

    if (argument === "--major" || argument === "--minor" || argument === "--patch") {
      level = argument.slice(2);
    }
  }

  return { baseRef, level };
}

function detectComparisonBase() {
  const candidates = [resolveUpstreamRef(), "origin/main", "main", "origin/master", "master"].filter(Boolean);

  for (const candidate of candidates) {
    if (gitRefExists(candidate)) {
      return candidate;
    }
  }

  return null;
}

function resolveUpstreamRef() {
  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"], {
      encoding: "utf8"
    }).trim();
  } catch {
    return null;
  }
}

function gitRefExists(ref) {
  try {
    execFileSync("git", ["rev-parse", "--verify", ref], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function hasExplicitVersionEdits(base) {
  for (const packageFile of workspacePackageFiles) {
    const currentManifest = readJson(packageFile);
    const baseManifest = readGitJson(base, packageFile);

    if (compareVersions(currentManifest.version, baseManifest.version) !== 0) {
      return true;
    }
  }

  const dependencyFiles = ["apps/docs/package.json", "packages/react/package.json", "packages/vue/package.json"];

  for (const packageFile of dependencyFiles) {
    const currentDependencyVersion = readJson(packageFile).dependencies?.["cindor-ui-core"];
    const baseDependencyVersion = readGitJson(base, packageFile).dependencies?.["cindor-ui-core"];

    if ((currentDependencyVersion ?? "") !== (baseDependencyVersion ?? "")) {
      return true;
    }
  }

  return false;
}
