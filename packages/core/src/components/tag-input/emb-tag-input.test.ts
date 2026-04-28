import "../../register.js";

import { EmbTagInput } from "./emb-tag-input.js";

describe("emb-tag-input", () => {
  it("commits a tag with Enter and renders it as a chip", async () => {
    const element = document.createElement("emb-tag-input") as EmbTagInput;
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    input.value = "Urgent";
    input.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.values).toEqual(["Urgent"]);
    expect(element.renderRoot.querySelector('[part="chip"]')?.textContent).toContain("Urgent");
  });

  it("removes the last tag with backspace when the draft is empty", async () => {
    const element = document.createElement("emb-tag-input") as EmbTagInput;
    element.values = ["Design", "Frontend"];
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Backspace", bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.values).toEqual(["Design"]);
  });

  it("marks itself invalid when required and empty", async () => {
    const element = document.createElement("emb-tag-input") as EmbTagInput;
    element.required = true;
    document.body.append(element);
    await element.updateComplete;

    expect(element.checkValidity()).toBe(false);
    expect((element.renderRoot.querySelector("input") as HTMLInputElement).getAttribute("aria-invalid")).toBe("true");
  });
});
