import { readFileSync } from "node:fs";

describe("cindor-ui-react generated entry", () => {
  it("wires command palette and autocomplete custom events", () => {
    const source = readFileSync("packages/react/src/index.tsx", "utf8");

    expect(source).toContain('export const CindorCommandPalette = createComponent({');
    expect(source).toContain('onCommandSelect: "command-select"');
    expect(source).toContain('export const CindorAutocomplete = createComponent({');
    expect(source).toContain('onSuggestionSelect: "suggestion-select"');
  });
});
