import { vi } from "vitest";

vi.mock("../shared/floating-position.js", () => ({
  attachFloatingPosition: () => ({
    cleanup: () => {},
    update: () => {}
  })
}));

import "../../register.js";

import { CindorDateRangePicker } from "./cindor-date-range-picker.js";

describe("cindor-date-range-picker", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("exposes a labeled popup trigger without nesting interactive semantics", async () => {
    const element = document.createElement("cindor-date-range-picker") as CindorDateRangePicker;
    element.setAttribute("aria-label", "Vacation range");
    document.body.append(element);
    await element.updateComplete;

    const field = element.renderRoot.querySelector('[part="field"]') as HTMLElement;
    const trigger = element.renderRoot.querySelector('[part="control"]') as HTMLButtonElement;

    expect(field.getAttribute("role")).toBeNull();
    expect(field.getAttribute("tabindex")).toBeNull();
    expect(trigger.getAttribute("aria-label")).toBe("Vacation range");
    expect(trigger.getAttribute("aria-haspopup")).toBe("grid");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    element.show();
    await element.updateComplete;

    const panel = element.renderRoot.querySelector("cindor-calendar") as HTMLElement;
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-label")).toBe("Vacation range");
  });

  it(
    "stores the selected start and end values",
    async () => {
      const element = document.createElement("cindor-date-range-picker") as CindorDateRangePicker;
      element.month = "2026-04";
      document.body.append(element);
      await element.updateComplete;

      element.show();
      await element.updateComplete;

      const getDayButton = (value: string): HTMLButtonElement => {
        const calendar = element.renderRoot.querySelector("cindor-calendar") as (HTMLElement & { renderRoot: ShadowRoot }) | null;
        const button = Array.from(calendar?.renderRoot.querySelectorAll(".day") ?? []).find(
          (candidate) => (candidate as HTMLButtonElement).value === value
        ) as HTMLButtonElement | undefined;

        expect(button).toBeDefined();
        return button as HTMLButtonElement;
      };

      getDayButton("2026-04-10").click();
      await element.updateComplete;
      getDayButton("2026-04-14").click();
      await element.updateComplete;

      expect(element.startValue).toBe("2026-04-10");
      expect(element.endValue).toBe("2026-04-14");
    },
    10000
  );

  it(
    "returns focus to the trigger after completing the range selection",
    async () => {
      const element = document.createElement("cindor-date-range-picker") as CindorDateRangePicker;
      element.month = "2026-04";
      document.body.append(element);
      await element.updateComplete;

      const trigger = element.renderRoot.querySelector('[part="control"]') as HTMLButtonElement;
      trigger.focus();
      element.show();
      await element.updateComplete;

      const getDayButton = (value: string): HTMLButtonElement => {
        const calendar = element.renderRoot.querySelector("cindor-calendar") as (HTMLElement & { renderRoot: ShadowRoot }) | null;
        const button = Array.from(calendar?.renderRoot.querySelectorAll(".day") ?? []).find(
          (candidate) => (candidate as HTMLButtonElement).value === value
        ) as HTMLButtonElement | undefined;

        expect(button).toBeDefined();
        return button as HTMLButtonElement;
      };

      getDayButton("2026-04-10").click();
      await element.updateComplete;
      getDayButton("2026-04-14").click();
      await element.updateComplete;

      expect(element.open).toBe(false);
      expect(document.activeElement).toBe(element);
      expect(element.shadowRoot?.activeElement).toBe(trigger);
    },
    10000
  );
});
