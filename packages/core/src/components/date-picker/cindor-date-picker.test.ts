import { afterEach, vi } from "vitest";

vi.mock("../shared/floating-position.js", () => ({
  attachFloatingPosition: () => ({
    cleanup: () => {},
    update: () => {}
  })
}));

import "../../register.js";

import { CindorDatePicker } from "./cindor-date-picker.js";

describe("cindor-date-picker", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it(
    "opens the calendar and commits the selected date",
    async () => {
      const element = document.createElement("cindor-date-picker") as CindorDatePicker;
      element.month = "2026-04";
      document.body.append(element);
      await element.updateComplete;

      element.show();
      await element.updateComplete;

      const calendar = element.renderRoot.querySelector("cindor-calendar") as HTMLElement & { value: string };
      calendar.value = "2026-04-20";
      calendar.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
      await element.updateComplete;

      expect(element.value).toBe("2026-04-20");
      expect(element.open).toBe(false);
    },
    10000
  );

  it("wires popup relationships onto the readonly field and toggle button", async () => {
    const element = document.createElement("cindor-date-picker") as CindorDatePicker;
    element.value = "2026-04-20";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector('input[part="control"]') as HTMLInputElement;
    const toggle = element.renderRoot.querySelector('[part="toggle-button"]') as HTMLElement & { updateComplete?: Promise<unknown>; renderRoot?: ShadowRoot };
    const clear = element.renderRoot.querySelector('[part="clear-button"]') as HTMLElement & { updateComplete?: Promise<unknown>; renderRoot?: ShadowRoot };

    await toggle.updateComplete;
    await clear.updateComplete;

    const toggleControl = toggle.renderRoot?.querySelector('[part="control"]') as HTMLElement;
    const clearControl = clear.renderRoot?.querySelector('[part="control"]') as HTMLElement;

    expect(input.getAttribute("aria-haspopup")).toBe("grid");
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.getAttribute("aria-controls")).toBeTruthy();
    expect(toggleControl.getAttribute("aria-haspopup")).toBe("grid");
    expect(toggleControl.getAttribute("aria-controls")).toBe(input.getAttribute("aria-controls"));
    expect(clearControl.hasAttribute("aria-haspopup")).toBe(false);
    expect(clearControl.hasAttribute("aria-expanded")).toBe(false);
    expect(clearControl.hasAttribute("aria-controls")).toBe(false);

    element.show();
    await element.updateComplete;
    await toggle.updateComplete;

    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect((toggle.renderRoot?.querySelector('[part="control"]') as HTMLElement).getAttribute("aria-expanded")).toBe("true");
    expect((element.renderRoot.querySelector("cindor-calendar") as HTMLElement).id).toBe(input.getAttribute("aria-controls"));
  });
});
