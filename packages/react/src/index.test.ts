import { readFileSync } from "node:fs";

describe("cindor-ui-react generated entry", () => {
  it("wires command palette, autocomplete, and event calendar custom events", () => {
    const source = readFileSync("packages/react/src/index.tsx", "utf8");
    const commandPaletteBlock = matchCreateComponentBlock(source, "CindorCommandPalette");
    const autocompleteBlock = matchCreateComponentBlock(source, "CindorAutocomplete");
    const eventCalendarBlock = matchCreateComponentBlock(source, "CindorEventCalendar");

    expect(commandPaletteBlock).toContain('onCommandSelect: "command-select"');
    expect(autocompleteBlock).toContain('onSuggestionSelect: "suggestion-select"');
    expect(eventCalendarBlock).toContain('onEventSelect: "event-select"');
  });
});

function matchCreateComponentBlock(source: string, componentName: string): string {
  const blockStart = `export const ${componentName} = createComponent({`;
  const startIndex = source.indexOf(blockStart);

  if (startIndex === -1) {
    throw new Error(`Missing generated wrapper block for ${componentName}`);
  }

  const endIndex = source.indexOf("\n});", startIndex);
  if (endIndex === -1) {
    throw new Error(`Missing generated wrapper block terminator for ${componentName}`);
  }

  return source.slice(startIndex, endIndex + "\n});".length);
}
