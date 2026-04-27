import "../../register.js";

import { EmbCalendar } from "./emb-calendar.js";

describe("emb-calendar", () => {
  it("renders the selected date in the visible month", async () => {
    const element = document.createElement("emb-calendar") as EmbCalendar;
    element.value = "2026-04-26";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="month"]')?.textContent).toContain("2026");
    expect(element.renderRoot.querySelector('[data-selected="true"]')?.textContent?.trim()).toBe("26");
  });

  it("updates the host value when a day is clicked", async () => {
    const element = document.createElement("emb-calendar") as EmbCalendar;
    element.month = "2026-04";
    document.body.append(element);
    await element.updateComplete;

    const dayButtons = Array.from(element.renderRoot.querySelectorAll(".day")) as HTMLButtonElement[];
    const targetDay = dayButtons.find((button) => button.value === "2026-04-15");
    targetDay?.click();
    await element.updateComplete;

    expect(element.value).toBe("2026-04-15");
  });

  it("disables dates outside the min and max range", async () => {
    const element = document.createElement("emb-calendar") as EmbCalendar;
    element.month = "2026-04";
    element.min = "2026-04-10";
    element.max = "2026-04-20";
    document.body.append(element);
    await element.updateComplete;

    const tooEarly = Array.from(element.renderRoot.querySelectorAll(".day")).find(
      (button) => (button as HTMLButtonElement).value === "2026-04-09"
    ) as HTMLButtonElement | undefined;
    const valid = Array.from(element.renderRoot.querySelectorAll(".day")).find(
      (button) => (button as HTMLButtonElement).value === "2026-04-15"
    ) as HTMLButtonElement | undefined;

    expect(tooEarly?.disabled).toBe(true);
    expect(valid?.disabled).toBe(false);
  });

  it("navigates between months", async () => {
    const element = document.createElement("emb-calendar") as EmbCalendar;
    element.month = "2026-04";
    document.body.append(element);
    await element.updateComplete;

    const nextButton = element.renderRoot.querySelector('[part="next-button"]') as HTMLElement;
    nextButton.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.month).toBe("2026-05");
  });

  it("selects a date range across two clicks when range mode is enabled", async () => {
    const element = document.createElement("emb-calendar") as EmbCalendar;
    element.range = true;
    element.month = "2026-04";
    document.body.append(element);
    await element.updateComplete;

    const dayButtons = Array.from(element.renderRoot.querySelectorAll(".day")) as HTMLButtonElement[];
    dayButtons.find((button) => button.value === "2026-04-10")?.click();
    await element.updateComplete;
    dayButtons.find((button) => button.value === "2026-04-14")?.click();
    await element.updateComplete;

    expect(element.startValue).toBe("2026-04-10");
    expect(element.endValue).toBe("2026-04-14");
    expect(element.renderRoot.querySelector('[data-in-range="true"]')?.textContent?.trim()).toBe("10");
    expect(element.renderRoot.querySelectorAll('[data-in-range="true"]')).toHaveLength(5);
  });

  it("shows the first selected range date immediately before the end date is chosen", async () => {
    const element = document.createElement("emb-calendar") as EmbCalendar;
    element.range = true;
    element.month = "2026-04";
    document.body.append(element);
    await element.updateComplete;

    const dayButtons = Array.from(element.renderRoot.querySelectorAll(".day")) as HTMLButtonElement[];
    dayButtons.find((button) => button.value === "2026-04-10")?.click();
    await element.updateComplete;

    const startButton = Array.from(element.renderRoot.querySelectorAll(".day")).find(
      (button) => (button as HTMLButtonElement).value === "2026-04-10"
    ) as HTMLButtonElement | undefined;

    expect(element.startValue).toBe("2026-04-10");
    expect(element.endValue).toBe("");
    expect(startButton?.getAttribute("data-selected")).toBe("true");
    expect(startButton?.getAttribute("data-range-start")).toBe("true");
  });

  it("shows two consecutive months in range mode", async () => {
    const element = document.createElement("emb-calendar") as EmbCalendar;
    element.range = true;
    element.month = "2026-04";
    document.body.append(element);
    await element.updateComplete;

    const monthTitles = Array.from(element.renderRoot.querySelectorAll('[part~="month"]')).map((node) => node.textContent?.trim());

    expect(monthTitles).toContain("April 2026");
    expect(monthTitles).toContain("May 2026");
    expect(element.renderRoot.querySelectorAll('[part~="calendar"]')).toHaveLength(2);
  });

  it("restarts the range after a completed selection", async () => {
    const element = document.createElement("emb-calendar") as EmbCalendar;
    element.range = true;
    element.startValue = "2026-04-10";
    element.endValue = "2026-04-14";
    element.month = "2026-04";
    document.body.append(element);
    await element.updateComplete;

    const dayButtons = Array.from(element.renderRoot.querySelectorAll(".day")) as HTMLButtonElement[];
    dayButtons.find((button) => button.value === "2026-04-20")?.click();
    await element.updateComplete;

    expect(element.startValue).toBe("2026-04-20");
    expect(element.endValue).toBe("");
  });
});
