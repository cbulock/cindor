import "../../register.js";

import { EmbInlineEdit } from "./emb-inline-edit.js";

describe("emb-inline-edit", () => {
  it("enters editing mode and saves the draft value", async () => {
    const element = document.createElement("emb-inline-edit") as EmbInlineEdit;
    element.value = "Old";
    document.body.append(element);
    await element.updateComplete;

    element.beginEdit();
    await element.updateComplete;
    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    input.value = "New";
    input.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
    element.save();
    await element.updateComplete;

    expect(element.value).toBe("New");
    expect(element.editing).toBe(false);
  });
});
