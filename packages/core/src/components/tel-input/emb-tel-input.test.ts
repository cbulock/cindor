import "../../register.js";

import { EmbTelInput } from "./emb-tel-input.js";

describe("emb-tel-input", () => {
  it("renders a native tel input", async () => {
    const element = document.createElement("emb-tel-input") as EmbTelInput;
    element.value = "555-0100";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.getAttribute("type")).toBe("tel");
    expect(input?.value).toBe("555-0100");
  });
});
