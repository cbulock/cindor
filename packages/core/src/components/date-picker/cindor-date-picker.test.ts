import "../../register.js";

import { CindorDatePicker } from "./cindor-date-picker.js";

describe("cindor-date-picker", () => {
  it("opens the calendar and commits the selected date", async () => {
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
  });
});
