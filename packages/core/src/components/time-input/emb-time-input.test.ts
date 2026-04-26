import "../../register.js";

import { EmbTimeInput } from "./emb-time-input.js";

describe("emb-time-input", () => {
  it("renders a native time input", async () => {
    const element = document.createElement("emb-time-input") as EmbTimeInput;
    element.value = "13:45";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.value).toBe("13:45");
    expect(input?.getAttribute("type")).toBe("time");
  });
});
