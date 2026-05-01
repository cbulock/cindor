import "../../register.js";

import { CindorSegmentedControl, type SegmentedControlOption } from "./cindor-segmented-control.js";

describe("cindor-segmented-control", () => {
  const options: SegmentedControlOption[] = [
    { label: "Day", value: "day" },
    { label: "Week", value: "week" },
    { disabled: true, label: "Month", value: "month" }
  ];

  it("renders radio options and updates the host value", async () => {
    const element = document.createElement("cindor-segmented-control") as CindorSegmentedControl;
    element.options = options;
    element.value = "day";
    document.body.append(element);
    await element.updateComplete;

    const radios = element.renderRoot.querySelectorAll("input");
    (radios[1] as HTMLInputElement).checked = true;
    radios[1]?.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("week");
  });

  it("forwards accessible naming to the radiogroup", async () => {
    const element = document.createElement("cindor-segmented-control") as CindorSegmentedControl;
    element.options = options;
    element.setAttribute("aria-label", "Timeline granularity");
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[role="radiogroup"]')?.getAttribute("aria-label")).toBe("Timeline granularity");
  });

  it("applies disabled state to disabled options", async () => {
    const element = document.createElement("cindor-segmented-control") as CindorSegmentedControl;
    element.options = options;
    document.body.append(element);
    await element.updateComplete;

    const radios = element.renderRoot.querySelectorAll("input");

    expect((radios[2] as HTMLInputElement).disabled).toBe(true);
  });
});
