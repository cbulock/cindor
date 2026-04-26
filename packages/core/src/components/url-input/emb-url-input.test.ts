import "../../register.js";

import { EmbUrlInput } from "./emb-url-input.js";

describe("emb-url-input", () => {
  it("renders a native url input", async () => {
    const element = document.createElement("emb-url-input") as EmbUrlInput;
    element.value = "https://emberline.dev";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.getAttribute("type")).toBe("url");
    expect(input?.value).toBe("https://emberline.dev");
  });
});
