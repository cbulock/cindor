import "../../register.js";

import { CindorRange } from "./cindor-range.js";

describe("cindor-range", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("syncs host value to the native range control", async () => {
    const element = document.createElement("cindor-range") as CindorRange;
    element.value = 25;
    element.max = 50;
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.value).toBe("25");
    expect(input?.max).toBe("50");
  });

  it("forwards aria labels and resets numeric values back to the default", async () => {
    const element = document.createElement("cindor-range") as CindorRange;
    element.setAttribute("value", "25");
    element.value = 25;
    element.min = 0;
    element.max = 50;
    element.step = 5;
    element.setAttribute("aria-label", "Volume");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(input.min).toBe("0");
    expect(input.max).toBe("50");
    expect(input.step).toBe("5");
    expect(input.getAttribute("aria-label")).toBe("Volume");

    input.value = "35";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe(35);

    element.formResetCallback();
    await element.updateComplete;

    expect(element.value).toBe(25);
    expect(input.value).toBe("25");
  });
});
