import "../../register.js";

import { EmbTimeInput } from "./emb-time-input.js";

describe("emb-time-input", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders a native time input", async () => {
    const element = document.createElement("emb-time-input") as EmbTimeInput;
    element.value = "13:45";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.value).toBe("13:45");
    expect(input?.getAttribute("type")).toBe("time");
  });

  it("inherits min, max, step, reset, and accessibility behavior", async () => {
    const element = document.createElement("emb-time-input") as EmbTimeInput;
    element.setAttribute("value", "09:30");
    element.value = "09:30";
    element.min = "09:00";
    element.max = "18:00";
    element.step = "900";
    element.setAttribute("aria-label", "Start time");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(input.min).toBe("09:00");
    expect(input.max).toBe("18:00");
    expect(input.step).toBe("900");
    expect(input.getAttribute("aria-label")).toBe("Start time");

    input.value = "10:15";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("10:15");

    element.formResetCallback();
    await element.updateComplete;

    expect(element.value).toBe("09:30");
    expect(input.value).toBe("09:30");
  });
});
