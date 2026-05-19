import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";

const DIST_ROOT = resolve("dist", "netlify");
const target = process.argv[2] ?? "all";

const siteTargets = {
  docs: {
    outDir: join(DIST_ROOT, "docs"),
    siteMode: "docs"
  },
  landing: {
    outDir: join(DIST_ROOT, "landing"),
    siteMode: "landing"
  }
};

const requestedTargets =
  target === "all"
    ? ["landing", "docs", "playground"]
    : Object.hasOwn(siteTargets, target) || target === "playground"
      ? [target]
      : fail(`Unsupported build target: ${target}`);

if (target === "all") {
  rmSync(DIST_ROOT, { force: true, recursive: true });
}

mkdirSync(DIST_ROOT, { recursive: true });
runCommand("npm", ["run", "generate:manifest"]);

for (const requestedTarget of requestedTargets) {
  if (requestedTarget === "playground") {
    const outDir = join(DIST_ROOT, "playground");
    resetOutputDirectory(outDir);
    runCommand(
      "npm",
      ["run", "build-storybook", "--", "--output-dir", toPosixPath(outDir)],
      {
        ...process.env,
        STORYBOOK_BASE_PATH: "/",
        STORYBOOK_BRAND_URL: "https://docs.cindor.dev/"
      }
    );
    continue;
  }

  const configuration = siteTargets[requestedTarget];
  resetOutputDirectory(configuration.outDir);
  runCommand(
    "npm",
    [
      "run",
      "build",
      "--workspace",
      "cindor-ui-docs",
      "--",
      "--outDir",
      toPosixPath(configuration.outDir)
    ],
    {
      ...process.env,
      DOCS_BASE_PATH: "/",
      VITE_DOCS_SITE_URL: "https://docs.cindor.dev/",
      VITE_PLAYGROUND_URL: "https://playground.cindor.dev/",
      VITE_PRIMARY_SITE_URL: "https://cindor.dev/",
      VITE_SITE_MODE: configuration.siteMode
    }
  );
}

function resetOutputDirectory(path) {
  rmSync(path, { force: true, recursive: true });
  mkdirSync(path, { recursive: true });
}

function runCommand(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env,
    shell: process.platform === "win32",
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function toPosixPath(value) {
  return value.replaceAll("\\", "/");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
