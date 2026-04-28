import "../../register.js";

import { EmbMultiSelect } from "./emb-multi-select.js";

describe("emb-multi-select", () => {
  it("toggles selections from keyboard interaction and exposes selected chips", async () => {
    const element = document.createElement("emb-multi-select") as EmbMultiSelect;
    element.innerHTML =
      '<emb-option value="design">Design</emb-option><emb-option value="engineering">Engineering</emb-option><emb-option value="product">Product</emb-option>';
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
    const element = document.createElement("emb-multi-select") as EmbMultiSelect;
    element.values = ["design", "engineering"];
    element.innerHTML =
      '<emb-option value="design">Design</emb-option><emb-option value="engineering">Engineering</emb-option><emb-option value="product">Product</emb-option>';
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.values).toEqual(["design"]);
  });

  it("marks itself invalid when required and empty", async () => {
    const element = document.createElement("emb-multi-select") as EmbMultiSelect;
    element.required = true;
    element.innerHTML = '<emb-option value="design">Design</emb-option><emb-option value="engineering">Engineering</emb-option>';
    document.body.append(element);
    await element.updateComplete;

    expect(element.checkValidity()).toBe(false);
    expect((element.renderRoot.querySelector("input") as HTMLInputElement).getAttribute("aria-invalid")).toBe("true");
  });
});
