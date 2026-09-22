import "../../register.js";

import { CindorDateTimeRangePicker } from "./cindor-date-time-range-picker.js";

describe("cindor-date-time-range-picker", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("combines endpoint date and time fields into ordered ISO date-time values", async () => {
    const element = document.createElement("cindor-date-time-range-picker") as CindorDateTimeRangePicker;
    element.startValue = "2026-04-28T10:00";
    element.endValue = "2026-04-28T11:00";
    document.body.append(element);
    await element.updateComplete;

    const endDate = element.renderRoot.querySelector('[part="end-endpoint"] cindor-date-picker') as HTMLElement & { value: string };
    endDate.value = "2026-04-27";
    endDate.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.startValue).toBe("2026-04-27T11:00");
    expect(element.endValue).toBe("2026-04-28T10:00");
  });

  it("applies date-time min and max boundaries to date and time controls", async () => {
    const element = document.createElement("cindor-date-time-range-picker") as CindorDateTimeRangePicker;
    element.min = "2026-04-28T09:30";
    element.max = "2026-04-30T17:00";
    element.startValue = "2026-04-28T10:00";
    element.endValue = "2026-04-30T16:00";
    document.body.append(element);
    await element.updateComplete;

    const startDate = element.renderRoot.querySelector('[part="start-endpoint"] cindor-date-picker') as HTMLElement & { min: string };
    const startTime = element.renderRoot.querySelector('[part="start-endpoint"] cindor-time-input') as HTMLElement & { min: string; max: string };
    const endTime = element.renderRoot.querySelector('[part="end-endpoint"] cindor-time-input') as HTMLElement & { min: string; max: string };

    expect(startDate.min).toBe("2026-04-28");
    expect(startTime.min).toBe("09:30");
    expect(startTime.max).toBe("");
    expect(endTime.max).toBe("17:00");
    expect(element.checkValidity()).toBe(true);

    element.endValue = "2026-04-30T18:00";
    await element.updateComplete;
    expect(element.checkValidity()).toBe(false);
    expect(element.renderRoot.querySelector('[part="validation-message"]')?.textContent).toContain("end on or before");
  });

  it("provides labelled keyboard-focusable endpoint controls and required validation", async () => {
    const element = document.createElement("cindor-date-time-range-picker") as CindorDateTimeRangePicker;
    element.required = true;
    element.setAttribute("aria-label", "Appointment window");
    document.body.append(element);
    await element.updateComplete;

    const startDate = element.renderRoot.querySelector('[part="start-endpoint"] cindor-date-picker') as HTMLElement;
    const startTime = element.renderRoot.querySelector('[part="start-endpoint"] cindor-time-input') as HTMLElement;

    expect(startDate.getAttribute("aria-label")).toBe("Appointment window start date");
    expect(startTime.getAttribute("aria-label")).toBe("Appointment window start time");
    expect(element.checkValidity()).toBe(false);
    expect(element.renderRoot.querySelector('[part="validation-message"]')?.textContent).toContain("select a start and end");

    element.focus();
    expect(startDate.shadowRoot?.activeElement).toBeTruthy();
  });
});
