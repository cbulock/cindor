import "../../register.js";

import { EmbLayoutHeader } from "./emb-layout-header.js";

describe("emb-layout-header", () => {
  it("renders content inside a header landmark", async () => {
    const element = document.createElement("emb-layout-header") as EmbLayoutHeader;
    element.innerHTML = "<h1>Overview</h1>";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("header")).not.toBeNull();
    expect(element.textContent).toContain("Overview");
  });
});
