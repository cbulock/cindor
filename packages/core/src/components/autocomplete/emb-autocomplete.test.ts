import "../../register.js";

import { EmbAutocomplete } from "./emb-autocomplete.js";

describe("emb-autocomplete", () => {
  it("filters suggestions and commits the active option", async () => {
    const element = document.createElement("emb-autocomplete") as EmbAutocomplete;
    element.suggestions = [
      { label: "Alpha" },
      { label: "Beta" },
      { label: "Gamma" }
    ];
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    input.value = "ga";
    input.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
    await element.updateComplete;
    input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "Enter" }));
    await element.updateComplete;

    expect(element.value).toBe("Gamma");
  });
});
