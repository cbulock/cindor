import "../../register.js";
import * as components from "../../index.js";
import { FormAssociatedElement } from "./form-associated-element.js";

const controls = (Object.values(components) as unknown[]).filter(
  (value): value is new () => FormAssociatedElement => typeof value === "function" && value.prototype instanceof FormAssociatedElement
);

describe("inherited disabled state", () => {
  afterEach(() => { document.body.replaceChildren(); });

  it.each(controls)("keeps explicit disabled separate for %s", async (Control) => {
    const element = new Control();
    document.body.append(element);
    await element.updateComplete;
    element.formDisabledCallback(true);
    await element.updateComplete;
    expect(element.disabled).toBe(false);
    expect(element.hasAttribute("disabled")).toBe(false);
    element.formDisabledCallback(false);
    await element.updateComplete;
    expect(element.disabled).toBe(false);
    element.disabled = true;
    await element.updateComplete;
    element.formDisabledCallback(true);
    element.formDisabledCallback(false);
    await element.updateComplete;
    expect(element.disabled).toBe(true);
    expect(element.hasAttribute("disabled")).toBe(true);
  });
});
