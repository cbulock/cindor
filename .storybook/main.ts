import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { StorybookConfig } from "@storybook/web-components-vite";
import { mergeConfig } from "vite";

const configuredStorybookBasePath = process.env.STORYBOOK_BASE_PATH?.trim();
const storybookBasePath = configuredStorybookBasePath
  ? configuredStorybookBasePath.endsWith("/")
    ? configuredStorybookBasePath
    : `${configuredStorybookBasePath}/`
  : "/";

const config: StorybookConfig = {
  stories: ["../packages/core/src/**/*.stories.ts"],
  staticDirs: [{ from: "../branding", to: "/branding" }],
  addons: [
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-vitest")
  ],
  framework: {
    name: getAbsolutePath("@storybook/web-components-vite"),
    options: {}
  },
  managerHead: async (head) =>
    `${head}
<link rel="icon" type="image/png" href="${storybookBasePath}branding/cindor-icon.png" />`,
  previewHead: async (head) =>
    `${head}
<link rel="icon" type="image/png" href="${storybookBasePath}branding/cindor-icon.png" />`,
  viteFinal: async (config) =>
    mergeConfig(config, {
      base: storybookBasePath
    })
};

export default config;

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
