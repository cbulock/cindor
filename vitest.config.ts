import { defineConfig } from "vitest/config";
import type { TestProjectConfiguration } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const unitProject: TestProjectConfiguration = {
  extends: true,
  test: {
    alias: {
      "cindor-ui-core/register": path.join(dirname, "packages", "core", "src", "register.ts"),
      "cindor-ui-core": path.join(dirname, "packages", "core", "src", "index.ts")
    },
    name: "unit",
    environment: "jsdom",
    globals: true,
    include: ["packages/**/*.test.ts", "scripts/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"]
  }
};

const storybookProject: TestProjectConfiguration = {
  extends: true,
  plugins: [
    // The plugin will run tests for the stories defined in your Storybook config.
    storybookTest({
      configDir: path.join(dirname, ".storybook")
    })
  ],
  test: {
    name: "storybook",
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({}),
      instances: [{
        browser: "chromium"
      }]
    }
  }
};

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [unitProject, storybookProject]
  }
});
