import "../../register.js";

import { EmbRadio } from "./emb-radio.js";

describe("emb-radio", () => {
  it("syncs checked state from the native radio input", async () => {
    const element = document.createElement("emb-radio") as EmbRadio;
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");
    expect(input).not.toBeNull();

    input!.checked = true;
    input!.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.checked).toBe(true);
  });
});
