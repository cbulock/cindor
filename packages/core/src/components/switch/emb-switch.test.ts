import "../../register.js";

import { EmbSwitch } from "./emb-switch.js";

describe("emb-switch", () => {
  it("syncs checked state from the native switch input", async () => {
    const element = document.createElement("emb-switch") as EmbSwitch;
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
