import "../../register.js";

import { EmbEmailInput } from "./emb-email-input.js";

describe("emb-email-input", () => {
  it("renders a native email input", async () => {
    const element = document.createElement("emb-email-input") as EmbEmailInput;
    element.value = "hello@example.com";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.value).toBe("hello@example.com");
    expect(input?.getAttribute("type")).toBe("email");
  });
});
