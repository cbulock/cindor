import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    alias: [
      {
        find: "cindor-ui-core/register",
        replacement: path.join(dirname, "packages", "core", "src", "register.ts")
      },
      {
        find: "cindor-ui-core",
        replacement: path.join(dirname, "packages", "core", "src", "index.ts")
      }
    ]
  },
  test: {
    projects: [{
      extends: true,
      test: {
        name: "unit",
        environment: "jsdom",
        globals: true,
        include: ["packages/**/*.test.ts", "scripts/**/*.test.ts"],
        setupFiles: ["./vitest.setup.ts"]
      }
    }, {
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
          provider: "playwright",
          instances: [{
            browser: "chromium"
          }]
        }
      }
    }]
  }
});
