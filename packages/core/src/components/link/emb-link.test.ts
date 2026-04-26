import "../../register.js";

import { EmbLink } from "./emb-link.js";

describe("emb-link", () => {
  it("syncs host href to the native anchor element", async () => {
    const element = document.createElement("emb-link") as EmbLink;
    element.href = "/docs";
    element.textContent = "Docs";
    document.body.append(element);
    await element.updateComplete;

    const anchor = element.renderRoot.querySelector("a");

    expect(anchor?.getAttribute("href")).toBe("/docs");
  });
});
