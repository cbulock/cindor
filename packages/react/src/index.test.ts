import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { CindorOtpInput } from "./index.js";
import type { CindorOtpInput as OtpElement } from "../../core/src/components/otp-input/cindor-otp-input.js";
import { readFileSync } from "node:fs";

// jsdom runs in Node; select the browser wrapper so layout effects set host properties.
vi.mock("@lit/react", () => import("../../../node_modules/@lit/react/development/index.js"));

describe("cindor-ui-react generated entry", () => {
  it("controls and clears OTP values and forwards user events", async () => {
    const container = document.createElement("div"); document.body.append(container);
    const root = createRoot(container);
    const onInput = vi.fn(), onChange = vi.fn(), onComplete = vi.fn();
    const render = (value: string) => flushSync(() => root.render(createElement(CindorOtpInput, { value, onInput, onChange, onComplete })));
    try {
      render("012345");
      const element = container.querySelector("cindor-otp-input") as OtpElement;
      await element.updateComplete;
      expect(element.value).toBe("012345"); expect(element.hasAttribute("value")).toBe(false);
      render(""); await element.updateComplete; expect(element.value).toBe("");
      expect(onInput).not.toHaveBeenCalled();
      const cell = element.shadowRoot!.querySelector("input")!;
      cell.value = "123456"; cell.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
      await element.updateComplete;
      cell.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      expect(onInput).toHaveBeenCalledTimes(1); expect(onComplete).toHaveBeenCalledTimes(1); expect(onChange).toHaveBeenCalledTimes(1);
    } finally { flushSync(() => root.unmount()); container.remove(); }
  });
  it("exports OTP input with all aggregate events", () => {
    const block = matchCreateComponentBlock(readFileSync("packages/react/src/index.tsx", "utf8"), "CindorOtpInput");
    expect(block).toContain('elementClass: CindorOtpInputElement');
    for (const event of ["Input", "Change", "Complete"]) expect(block).toContain(`on${event}: "${event.toLowerCase()}"`);
  });
  it("exports the diff viewer with its core element class", () => {
    const source = readFileSync("packages/react/src/index.tsx", "utf8");
    const block = matchCreateComponentBlock(source, "CindorDiffViewer");
    expect(block).toContain('tagName: "cindor-diff-viewer"');
    expect(block).toContain("elementClass: CindorDiffViewerElement");
  });

  it("maps searchable dropdown committed events", () => {
    const source = readFileSync("packages/react/src/index.tsx", "utf8");
    const block = matchCreateComponentBlock(source, "CindorSearchableDropdown");
    expect(block).toContain('onInput: "input"');
    expect(block).toContain('onChange: "change"');
  });
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
