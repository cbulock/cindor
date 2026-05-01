import "../../register.js";

import { EmbLayoutContent } from "./emb-layout-content.js";

describe("emb-layout-content", () => {
  it("renders slotted content inside a section region", async () => {
    const element = document.createElement("emb-layout-content") as EmbLayoutContent;
    element.innerHTML = "<p>Primary content</p>";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("section")).not.toBeNull();
    expect(element.textContent).toContain("Primary content");
  });
});
