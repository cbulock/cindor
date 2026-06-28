import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";

try {
  const gitCommonDir = execFileSync("git", ["rev-parse", "--git-common-dir"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  }).trim();

  if (!gitCommonDir) {
    process.exit(0);
  }

  const hooksDir = join(gitCommonDir, "hooks");
  const prePushPath = join(hooksDir, "pre-push");

  if (!existsSync(prePushPath)) {
    process.exit(0);
  }

  const hookContents = readFileSync(prePushPath, "utf8");

  if (!isStaleVersionAutoBumpHook(hookContents)) {
    process.exit(0);
  }

  const backupPath = getBackupPath(hooksDir);
  mkdirSync(dirname(backupPath), { recursive: true });
  renameSync(prePushPath, backupPath);

  console.log(`Moved stale pre-push hook to ${backupPath}.`);
} catch {
  process.exit(0);
}

function getBackupPath(hooksDir) {
  const defaultBackupPath = join(hooksDir, "pre-push.stale-version-auto-bump");

  if (!existsSync(defaultBackupPath)) {
    return defaultBackupPath;
  }

  let suffix = 1;

  while (true) {
    const candidatePath = `${defaultBackupPath}.${suffix}`;

    if (!existsSync(candidatePath)) {
      return candidatePath;
    }

    suffix += 1;
  }
}

function isStaleVersionAutoBumpHook(hookContents) {
  if (!hookContents.includes("npm run version:auto-bump")) {
    return false;
  }

  const strippedContents = stripComments(hookContents)
    .replace(/\r/g, "")
    .trim();

  const sanitizedContents = strippedContents
    .replace(/^#![^\n]*\n?/, "")
    .replace(/\b(?:export\s+)?SKIP_SIMPLE_GIT_HOOKS=\d+\s*/g, "")
    .replace(/\bSIMPLE_GIT_HOOKS_RC=[^\n]+\s*/g, "")
    .replace(/\bnpm run version:auto-bump\b/g, "")
    .replace(/\b(?:exec\s+)?(?:npm|npx)\b/g, "")
    .replace(/[;&|(){}[\]"'`\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return sanitizedContents.length === 0;
}

function stripComments(hookContents) {
  return hookContents
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("#"))
    .join("\n");
}
