import "../../register.js";

import { CindorDateTimePicker } from "./cindor-date-time-picker.js";

describe("cindor-date-time-picker", () => {
  it("combines the child date and time values", async () => {
    const element = document.createElement("cindor-date-time-picker") as CindorDateTimePicker;
    document.body.append(element);
    await element.updateComplete;

    const datePicker = element.renderRoot.querySelector("cindor-date-picker") as HTMLElement & { value: string };
    const timeInput = element.renderRoot.querySelector("cindor-time-input") as HTMLElement & { value: string };

    datePicker.value = "2026-04-28";
    datePicker.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    timeInput.value = "09:30";
    timeInput.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.value).toBe("2026-04-28T09:30");
  });
});
