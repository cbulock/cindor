import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    workspace: [{
      extends: true,
      test: {
        environment: "jsdom",
        globals: true,
        include: ["packages/**/*.test.ts"]
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
