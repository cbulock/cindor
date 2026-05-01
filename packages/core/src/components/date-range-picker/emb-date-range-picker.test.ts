import "../../register.js";

import { EmbDateRangePicker } from "./emb-date-range-picker.js";

describe("emb-date-range-picker", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("stores the selected start and end values", async () => {
    const element = document.createElement("emb-date-range-picker") as EmbDateRangePicker;
    element.month = "2026-04";
    document.body.append(element);
    await element.updateComplete;

    element.show();
    await element.updateComplete;

    const getDayButton = (value: string): HTMLButtonElement => {
      const calendar = element.renderRoot.querySelector("emb-calendar") as (HTMLElement & { renderRoot: ShadowRoot }) | null;
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
  });
});
