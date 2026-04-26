import "../../register.js";

import { EmbNumberInput } from "./emb-number-input.js";

describe("emb-number-input", () => {
  it("syncs host value to the native number input", async () => {
    const element = document.createElement("emb-number-input") as EmbNumberInput;
    element.value = "42";
    element.max = "100";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.value).toBe("42");
    expect(input?.getAttribute("type")).toBe("number");
  });
});
