import "../../register.js";

import { CindorTabPanel } from "./cindor-tab-panel.js";

describe("cindor-tab-panel", () => {
  it("reflects label and value attributes", async () => {
    const element = document.createElement("cindor-tab-panel") as CindorTabPanel;
    element.label = "Overview";
    element.value = "overview";

    document.body.append(element);
    await element.updateComplete;

    expect(element.getAttribute("label")).toBe("Overview");
    expect(element.getAttribute("value")).toBe("overview");
  });
});
