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

  it("uses an accessible popup trigger for the range summary", async () => {
    const element = document.createElement("cindor-date-range-picker") as CindorDateRangePicker;
    element.setAttribute("aria-label", "Project schedule");
    document.body.append(element);
    await element.updateComplete;

    const summaryButton = element.renderRoot.querySelector('[part="summary-button"]') as HTMLButtonElement;
    const toggle = element.renderRoot.querySelector('[part="toggle-button"]') as HTMLElement & { updateComplete?: Promise<unknown>; renderRoot?: ShadowRoot };

    await toggle.updateComplete;

    const toggleControl = toggle.renderRoot?.querySelector('[part="control"]') as HTMLElement;

    expect(summaryButton.getAttribute("aria-label")).toBe("Project schedule");
    expect(summaryButton.getAttribute("aria-haspopup")).toBe("grid");
    expect(summaryButton.getAttribute("aria-expanded")).toBe("false");
    expect(summaryButton.getAttribute("aria-controls")).toBeTruthy();
    expect(toggleControl.getAttribute("aria-haspopup")).toBe("grid");
    expect(toggleControl.getAttribute("aria-controls")).toBe(summaryButton.getAttribute("aria-controls"));

    summaryButton.click();
    await element.updateComplete;
    await toggle.updateComplete;

    expect(element.open).toBe(true);
    expect(summaryButton.getAttribute("aria-expanded")).toBe("true");
    expect((toggle.renderRoot?.querySelector('[part="control"]') as HTMLElement).getAttribute("aria-expanded")).toBe("true");
    expect((element.renderRoot.querySelector("cindor-calendar") as HTMLElement).id).toBe(summaryButton.getAttribute("aria-controls"));
  });

  it("renders a polished icon separator for partial and full ranges", async () => {
    const element = document.createElement("cindor-date-range-picker") as CindorDateRangePicker;
    element.startValue = "2026-04-10";
    document.body.append(element);
    await element.updateComplete;

    let summaryText = element.renderRoot.querySelector('[part="summary"]')?.textContent?.replace(/\s+/g, " ").trim();
    let separator = element.renderRoot.querySelector('[part="summary-separator"]') as HTMLElement | null;

    expect(summaryText).toBe("2026-04-10");
    expect(separator?.getAttribute("name")).toBe("chevron-right");
    expect(element.renderRoot.querySelector('[part="summary"]')?.textContent).not.toContain("->");

    element.endValue = "2026-04-14";
    await element.updateComplete;

    summaryText = element.renderRoot.querySelector('[part="summary"]')?.textContent?.replace(/\s+/g, " ").trim();
    separator = element.renderRoot.querySelector('[part="summary-separator"]') as HTMLElement | null;

    expect(summaryText).toBe("2026-04-10 2026-04-14");
    expect(separator?.getAttribute("name")).toBe("chevron-right");
    expect(element.renderRoot.querySelector('[part="summary"]')?.textContent).not.toContain("->");
  });
});
