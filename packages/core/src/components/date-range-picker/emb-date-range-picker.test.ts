import "../../register.js";

import { EmbDateRangePicker } from "./emb-date-range-picker.js";

describe("emb-date-range-picker", () => {
  it("stores the selected start and end values", async () => {
    const element = document.createElement("emb-date-range-picker") as EmbDateRangePicker;
    element.month = "2026-04";
    document.body.append(element);
    await element.updateComplete;

    element.show();
    await element.updateComplete;

    const calendar = element.renderRoot.querySelector("emb-calendar") as HTMLElement & {
      startValue: string;
      endValue: string;
    };
    calendar.startValue = "2026-04-10";
    calendar.endValue = "2026-04-14";
    calendar.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.startValue).toBe("2026-04-10");
    expect(element.endValue).toBe("2026-04-14");
  });
});
