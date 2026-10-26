import type { ComponentType } from "react";
import { CindorButton, CindorIconButton, CindorSplitButton } from "./index.js";
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

const buttonEvents = [
  ["onClick", "click"], ["onKeyDown", "keydown"], ["onKeyUp", "keyup"],
  ["onPointerDown", "pointerdown"], ["onPointerUp", "pointerup"],
  ["onMouseDown", "mousedown"], ["onMouseUp", "mouseup"],
  ["onFocus", "focusin"], ["onBlur", "focusout"], ["onContextMenu", "contextmenu"]
] as const;

async function deepestButton(host: Element): Promise<HTMLButtonElement> {
  const element = host as Element & { updateComplete: Promise<unknown> };
  await Promise.resolve();
  await element.updateComplete;
  const inner = host.shadowRoot!.querySelector("cindor-button");
  if (inner) return deepestButton(inner);
  return host.shadowRoot!.querySelector("button")!;
}

describe.each([CindorButton, CindorIconButton, CindorSplitButton])("mounted button forwarding", (Component) => {
  it.each([
    ["aria-pressed", "mixed"], ["aria-busy", "true"], ["aria-disabled", "false"],
    ["aria-current", "page"], ["aria-keyshortcuts", "Alt+S"], ["aria-roledescription", "action"],
    ["aria-controls", "panel"], ["aria-expanded", "false"], ["aria-haspopup", "menu"]
  ])("preserves %s values and removal on the native control", async (attribute, initial) => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const render = (props: Record<string, unknown>) => flushSync(() => root.render(createElement(Component as ComponentType<Record<string, unknown>>, props)));
    const cleanup = () => flushSync(() => root.unmount());
    try {
      for (const value of [initial, undefined, true, false, "mixed", null]) {
        await render({ [attribute]: value });
        const button = await deepestButton(container.firstElementChild!);
        expect(button.getAttribute(attribute)).toBe(value == null ? null : String(value));
      }
      const host = container.firstElementChild!;
      host.remove();
      host.setAttribute(attribute, initial);
      container.append(host);
      expect((await deepestButton(host)).getAttribute(attribute)).toBe(initial);
    } finally { cleanup(); container.remove(); }
  });

  it("preserves disabled activation and imperative focus/click", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const render = (props: Record<string, unknown>) => flushSync(() => root.render(createElement(Component as ComponentType<Record<string, unknown>>, props)));
    const cleanup = () => flushSync(() => root.unmount());
    const click = vi.fn();
    try {
      await render({ disabled: true, onClick: click });
      const host = container.firstElementChild as HTMLElement;
      const button = await deepestButton(host);
      host.click();
      expect(button.disabled).toBe(true);
      expect(click).not.toHaveBeenCalled();
      await render({ disabled: false, onClick: click });
      await deepestButton(host);
      
      host.focus();
      expect((button.getRootNode() as ShadowRoot).activeElement).toBe(button);
      host.click();
      expect(click).toHaveBeenCalledTimes(1);
    } finally { cleanup(); container.remove(); }
  });

  it.each(buttonEvents)("delivers %s once and updates/removes handlers", async (prop, type) => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    const render = (props: Record<string, unknown>) => flushSync(() => root.render(createElement(Component as ComponentType<Record<string, unknown>>, props)));
    const cleanup = () => flushSync(() => root.unmount());
    const first = vi.fn((event: Event) => event.preventDefault());
    const second = vi.fn();
    try {
      const capture = vi.fn();
      const outer = vi.fn();
      container.addEventListener(type, outer);
      await render({ [prop]: first, [prop + "Capture"]: capture });
      const button = await deepestButton(container.firstElementChild!);
      const options = { bubbles: true, composed: true, cancelable: true };
      const event = type.startsWith("key")
        ? new KeyboardEvent(type, { ...options, key: "Enter" })
        : type.startsWith("focus")
          ? new FocusEvent(type, { ...options, relatedTarget: container })
          : new MouseEvent(type, { ...options, clientX: 17 });
      expect(button.dispatchEvent(event)).toBe(false);
      expect(first).toHaveBeenCalledTimes(1);
      expect(capture).toHaveBeenCalledTimes(1);
      expect(outer).toHaveBeenCalledTimes(1);
      const received = first.mock.calls[0][0] as unknown as { nativeEvent: Event };
      expect(received.nativeEvent).toBe(event);
      if (event instanceof KeyboardEvent) expect((first.mock.calls[0][0] as KeyboardEvent).key).toBe("Enter");
      if (event instanceof MouseEvent) expect((first.mock.calls[0][0] as MouseEvent).clientX).toBe(17);
      await render({ [prop]: second });
      button.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
      expect(first).toHaveBeenCalledTimes(1);
      expect(second).toHaveBeenCalledTimes(1);
      await render({});
      button.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
      expect(second).toHaveBeenCalledTimes(1);
    } finally { cleanup(); container.remove(); }
  });
});
