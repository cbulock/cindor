import "../../register.js";

import { CindorFormField } from "./cindor-form-field.js";

describe("cindor-form-field", () => {
  it("wires label and descriptions to a slotted custom control", async () => {
    const element = document.createElement("cindor-form-field") as CindorFormField;
    element.label = "Email";
    element.description = "Used for notifications";
    element.error = "Required";
    element.innerHTML = `<cindor-input></cindor-input>`;
    document.body.append(element);
    await element.updateComplete;

    const control = element.querySelector("cindor-input");

    expect(control?.getAttribute("aria-labelledby")).toContain("-label");
    expect(control?.getAttribute("aria-describedby")).toContain("-description");
    expect(control?.getAttribute("aria-describedby")).toContain("-error");
  });

  it("associates native controls through the label for attribute", async () => {
    const element = document.createElement("cindor-form-field") as CindorFormField;
    element.label = "Display name";
    element.innerHTML = `<input />`;
    document.body.append(element);
    await element.updateComplete;

    const label = element.shadowRoot?.querySelector("label");
    const input = element.querySelector("input");

    expect(label?.getAttribute("for")).toBe(input?.id);
  });

  it("renders managed validation errors alongside authored wiring", async () => {
    const element = document.createElement("cindor-form-field") as CindorFormField;
    element.label = "Email";
    element.validationError = "Email is required";
    element.innerHTML = `<cindor-input></cindor-input>`;
    document.body.append(element);
    await element.updateComplete;

    const control = element.querySelector("cindor-input");

    expect(element.shadowRoot?.textContent).toContain("Email is required");
    expect(control?.getAttribute("aria-describedby")).toContain("-error");
  });
});
