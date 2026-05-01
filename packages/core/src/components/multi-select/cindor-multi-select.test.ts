import "../../register.js";

import { CindorMultiSelect } from "./cindor-multi-select.js";

describe("cindor-multi-select", () => {
  it("toggles selections from keyboard interaction and exposes selected chips", async () => {
    const element = document.createElement("cindor-multi-select") as CindorMultiSelect;
    element.innerHTML =
      '<cindor-option value="design">Design</cindor-option><cindor-option value="engineering">Engineering</cindor-option><cindor-option value="product">Product</cindor-option>';
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    input.dispatchEvent(new FocusEvent("focus"));
    await element.updateComplete;
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.values).toEqual(["design"]);
    expect(element.renderRoot.querySelector('[part="chip"]')?.textContent).toContain("Design");
  });

  it("removes the last selected value with backspace when the query is empty", async () => {
    const element = document.createElement("cindor-multi-select") as CindorMultiSelect;
    element.values = ["design", "engineering"];
    element.innerHTML =
      '<cindor-option value="design">Design</cindor-option><cindor-option value="engineering">Engineering</cindor-option><cindor-option value="product">Product</cindor-option>';
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.values).toEqual(["design"]);
  });

  it("marks itself invalid when required and empty", async () => {
    const element = document.createElement("cindor-multi-select") as CindorMultiSelect;
    element.required = true;
    element.innerHTML = '<cindor-option value="design">Design</cindor-option><cindor-option value="engineering">Engineering</cindor-option>';
    document.body.append(element);
    await element.updateComplete;

    expect(element.checkValidity()).toBe(false);
    expect((element.renderRoot.querySelector("input") as HTMLInputElement).getAttribute("aria-invalid")).toBe("true");
  });
});
