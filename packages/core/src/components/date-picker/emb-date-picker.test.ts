import "../../register.js";

import { EmbDatePicker } from "./emb-date-picker.js";

describe("emb-date-picker", () => {
  it("opens the calendar and commits the selected date", async () => {
    const element = document.createElement("emb-date-picker") as EmbDatePicker;
    element.month = "2026-04";
    document.body.append(element);
    await element.updateComplete;

    element.show();
    await element.updateComplete;

    const calendar = element.renderRoot.querySelector("emb-calendar") as HTMLElement & { value: string };
    calendar.value = "2026-04-20";
    calendar.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.value).toBe("2026-04-20");
    expect(element.open).toBe(false);
  });
});
