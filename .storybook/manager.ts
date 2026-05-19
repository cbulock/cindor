import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

import "../packages/core/src/design/fonts.css";

addons.setConfig({
  theme: create({
    base: "dark",
    colorPrimary: "#e07d2c",
    colorSecondary: "#e07d2c",
    appBg: "#0f0e0c",
    appContentBg: "#161512",
    appHoverBg: "#1d1c19",
    appPreviewBg: "#0f0e0c",
    appBorderColor: "#2c2a26",
    appBorderRadius: 6,
    fontBase: '"Mona Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    fontCode: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    textColor: "#f3f1ec",
    textInverseColor: "#0f0e0c",
    textMutedColor: "#b8b3a2",
    barTextColor: "#b8b3a2",
    barHoverColor: "#f3f1ec",
    barSelectedColor: "#e07d2c",
    barBg: "#161512",
    buttonBg: "#1d1c19",
    buttonBorder: "#2c2a26",
    booleanBg: "#42403a",
    booleanSelectedBg: "#e07d2c",
    inputBg: "#161512",
    inputBorder: "#2c2a26",
    inputTextColor: "#f3f1ec",
    inputBorderRadius: 4,
    brandTitle: "Cindor UI",
    brandUrl: "https://cbulock.github.io/cindor/"
  })
});
