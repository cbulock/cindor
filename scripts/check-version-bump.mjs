import {
  compareVersions,
  fail,
  getChangedFiles,
  getChangedReleaseRelevantFiles,
  readGitJson,
  readJson,
  versionFiles,
  workspacePackageFiles,
  isZeroSha
} from "./versioning.mjs";

const baseRef = process.argv[2] ?? process.env.VERSION_CHECK_BASE;
const headRef = process.argv[3] ?? process.env.VERSION_CHECK_HEAD;

if (!baseRef) {
  fail("Missing base ref. Pass a git ref as the first argument or set VERSION_CHECK_BASE.");
}

const changedFiles = getChangedFiles(baseRef, headRef);
const changedReleaseRelevantFiles = getChangedReleaseRelevantFiles(changedFiles);

if (changedReleaseRelevantFiles.length === 0) {
  console.log("No release-relevant files changed; skipping version bump enforcement.");
  process.exit(0);
}

const changedVersionFiles = versionFiles.filter((file) => changedFiles.includes(file));
const missingVersionFiles = versionFiles.filter((file) => !changedVersionFiles.includes(file));

if (missingVersionFiles.length > 0) {
  fail(
    [
      "Detected release-relevant changes without a full version bump.",
      `Changed release-relevant files: ${changedReleaseRelevantFiles.join(", ")}`,
      `Missing version updates: ${missingVersionFiles.join(", ")}`
    ].join("\n")
  );
}

const currentRootVersion = readJson("package.json").version;
if (!isZeroSha(baseRef)) {
  const baseRootVersion = readGitJson(baseRef, "package.json").version;

  if (compareVersions(currentRootVersion, baseRootVersion) <= 0) {
    fail(`Root package version must increase. Base=${baseRootVersion}, current=${currentRootVersion}.`);
  }
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
