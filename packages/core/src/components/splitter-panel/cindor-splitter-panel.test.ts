import "../../register.js";

import { CindorSplitterPanel } from "./cindor-splitter-panel.js";

describe("cindor-splitter-panel", () => {
  it("renders slotted panel content", async () => {
    const element = document.createElement("cindor-splitter-panel") as CindorSplitterPanel;
    element.innerHTML = "<p>Navigation</p>";
    document.body.append(element);
    await element.updateComplete;

    expect(element.textContent).toContain("Navigation");
  });
});
