import "../../register.js";

import { EmbNumberInput } from "./emb-number-input.js";

describe("emb-number-input", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("syncs host value to the native number input", async () => {
    const element = document.createElement("emb-number-input") as EmbNumberInput;
    element.value = "42";
    element.max = "100";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.value).toBe("42");
    expect(input?.getAttribute("type")).toBe("number");
  });

  it("inherits min, max, step, reset, and accessibility behavior", async () => {
    const element = document.createElement("emb-number-input") as EmbNumberInput;
    element.setAttribute("value", "42");
    element.value = "42";
    element.min = "0";
    element.max = "100";
    element.step = "5";
    element.setAttribute("aria-label", "Build number");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(input.min).toBe("0");
    expect(input.max).toBe("100");
    expect(input.step).toBe("5");
    expect(input.getAttribute("aria-label")).toBe("Build number");

    input.value = "55";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("55");

    element.formResetCallback();
    await element.updateComplete;

    expect(element.value).toBe("42");
    expect(input.value).toBe("42");
  });
});
