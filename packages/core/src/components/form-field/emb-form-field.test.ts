import "../../register.js";

import { EmbFormField } from "./emb-form-field.js";

describe("emb-form-field", () => {
  it("wires label and descriptions to a slotted custom control", async () => {
    const element = document.createElement("emb-form-field") as EmbFormField;
    element.label = "Email";
    element.description = "Used for notifications";
    element.error = "Required";
    element.innerHTML = `<emb-input></emb-input>`;
    document.body.append(element);
    await element.updateComplete;

    const control = element.querySelector("emb-input");

    expect(control?.getAttribute("aria-labelledby")).toContain("-label");
    expect(control?.getAttribute("aria-describedby")).toContain("-description");
    expect(control?.getAttribute("aria-describedby")).toContain("-error");
  });

  it("associates native controls through the label for attribute", async () => {
    const element = document.createElement("emb-form-field") as EmbFormField;
    element.label = "Display name";
    element.innerHTML = `<input />`;
    document.body.append(element);
    await element.updateComplete;

    const label = element.shadowRoot?.querySelector("label");
    const input = element.querySelector("input");

    expect(label?.getAttribute("for")).toBe(input?.id);
  });
});
