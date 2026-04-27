import "../../register.js";

import { EmbSplitterPanel } from "./emb-splitter-panel.js";

describe("emb-splitter-panel", () => {
  it("renders slotted panel content", async () => {
    const element = document.createElement("emb-splitter-panel") as EmbSplitterPanel;
    element.innerHTML = "<p>Navigation</p>";
    document.body.append(element);
    await element.updateComplete;

    expect(element.textContent).toContain("Navigation");
  });
});
