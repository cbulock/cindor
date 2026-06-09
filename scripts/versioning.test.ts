import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { getChangedFiles, getChangedReleaseRelevantFiles, isDocsOnlyFile, resolveDiffBase } from "./versioning.mjs";

describe("versioning helpers", () => {
  const originalCwd = process.cwd();

  afterEach(() => {
    process.chdir(originalCwd);
  });

  it("treats docs app changes as docs-only", () => {
    expect(isDocsOnlyFile("apps/docs/src/main.ts")).toBe(true);
    expect(isDocsOnlyFile("README.md")).toBe(true);
    expect(isDocsOnlyFile("packages/core/src/components/button/cindor-button.ts")).toBe(false);
  });

  it("filters release-relevant files out of docs-only diffs", () => {
    expect(
      getChangedReleaseRelevantFiles([
        ".gitignore",
        "apps/docs/src/main.ts",
        "docs/roadmap.md",
        "README.md",
        "scripts/versioning.test.ts",
        "package.json",
        "packages/core/src/components/button/cindor-button.ts"
      ])
    ).toEqual(["packages/core/src/components/button/cindor-button.ts"]);
  });

  it("diffs from the merge base when main advances after a branch is cut", () => {
    const repoDir = mkdtempSync(join(tmpdir(), "cindor-versioning-"));
    process.chdir(repoDir);

    runGit(["init", "--initial-branch=main"]);
    runGit(["config", "user.name", "Zeno"]);
    runGit(["config", "user.email", "zeno@example.com"]);

    mkdirSync("apps/docs/src", { recursive: true });
    writeFileSync("README.md", "base\n", "utf8");
    writeFileSync("apps/docs/src/main.ts", "export const page = 'base';\n", "utf8");
    runGit(["add", "."]);
    runGit(["commit", "-m", "base"]);
    const baseSha = runGit(["rev-parse", "HEAD"]);

    runGit(["checkout", "-b", "feature/docs-shell"]);
    writeFileSync("apps/docs/src/main.ts", "export const page = 'feature';\n", "utf8");
    runGit(["commit", "-am", "docs change"]);

    runGit(["checkout", "main"]);
    mkdirSync("packages/core/src/components/button", { recursive: true });
    writeFileSync("packages/core/src/components/button/cindor-button.ts", "export const touched = true;\n", "utf8");
    runGit(["add", "."]);
    runGit(["commit", "-m", "core change on main"]);

    runGit(["checkout", "feature/docs-shell"]);

    expect(resolveDiffBase("main", "HEAD")).toBe(baseSha);
    expect(getChangedFiles("main", "HEAD")).toEqual(["apps/docs/src/main.ts"]);
    expect(getChangedReleaseRelevantFiles(getChangedFiles("main", "HEAD"))).toEqual([]);
  });
});

function runGit(args: string[]) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}
