import "../../register.js";

import { EmbDateTimePicker } from "./emb-date-time-picker.js";

describe("emb-date-time-picker", () => {
  it("combines the child date and time values", async () => {
    const element = document.createElement("emb-date-time-picker") as EmbDateTimePicker;
    document.body.append(element);
    await element.updateComplete;

    const datePicker = element.renderRoot.querySelector("emb-date-picker") as HTMLElement & { value: string };
    const timeInput = element.renderRoot.querySelector("emb-time-input") as HTMLElement & { value: string };

    datePicker.value = "2026-04-28";
    datePicker.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    timeInput.value = "09:30";
    timeInput.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.value).toBe("2026-04-28T09:30");
  });
});
