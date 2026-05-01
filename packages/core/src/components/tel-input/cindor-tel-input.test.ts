import "../../register.js";

import { CindorTelInput } from "./cindor-tel-input.js";

describe("cindor-tel-input", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders a native tel input", async () => {
    const element = document.createElement("cindor-tel-input") as CindorTelInput;
    element.value = "555-0100";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.getAttribute("type")).toBe("tel");
    expect(input?.value).toBe("555-0100");
  });

  it("applies tel autocomplete and supports reset plus aria forwarding", async () => {
    const element = document.createElement("cindor-tel-input") as CindorTelInput;
    element.setAttribute("value", "555-0100");
    element.value = "555-0100";
    element.setAttribute("aria-label", "Phone number");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(input.autocomplete).toBe("tel");
    expect(input.getAttribute("aria-label")).toBe("Phone number");

    input.value = "555-0111";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("555-0111");

    element.formResetCallback();
    await element.updateComplete;

    expect(element.value).toBe("555-0100");
    expect(input.value).toBe("555-0100");
  });
});
