import "../../register.js";

import type { CindorInput } from "../input/cindor-input.js";

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

    const control = element.querySelector("cindor-input") as CindorInput | null;
    const input = control?.renderRoot.querySelector("input");

    expect(control?.getAttribute("aria-labelledby")).toContain("-label");
    expect(control?.getAttribute("aria-describedby")).toContain("-description");
    expect(control?.getAttribute("aria-describedby")).toContain("-error");
    const labelledById = input?.getAttribute("aria-labelledby");
    const describedById = input?.getAttribute("aria-describedby");
    const labelMirror = labelledById ? control?.renderRoot.querySelector(`#${labelledById}`) : null;
    const descriptionMirror = describedById ? control?.renderRoot.querySelector(`#${describedById}`) : null;

    expect(labelledById).toMatch(/-label$/);
    expect(describedById).toMatch(/-description$/);
    expect(labelMirror?.textContent).toBe("Email");
    expect(descriptionMirror?.textContent).toBe("Used for notifications Required");
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
