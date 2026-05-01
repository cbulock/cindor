import "../../register.js";

import { CindorMeter } from "./cindor-meter.js";

describe("cindor-meter", () => {
  it("syncs host values to the native meter element", async () => {
    const element = document.createElement("cindor-meter") as CindorMeter;
    element.min = 0;
    element.low = 20;
    element.high = 80;
    element.max = 100;
    element.optimum = 90;
    element.value = 72;
    document.body.append(element);
    await element.updateComplete;

    const meter = element.renderRoot.querySelector("meter");

    expect(meter?.value).toBe(72);
    expect(meter?.optimum).toBe(90);
  });
});
