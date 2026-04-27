// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config({
  ignores: ["**/dist/**", "**/node_modules/**", "coverage/**", "storybook-static/**"]
}, js.configs.recommended, ...tseslint.configs.recommended, {
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node
    }
  }
}, storybook.configs["flat/recommended"]);
