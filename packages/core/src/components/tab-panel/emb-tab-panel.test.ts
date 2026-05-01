import "../../register.js";

import { EmbTabPanel } from "./emb-tab-panel.js";

describe("emb-tab-panel", () => {
  it("reflects label and value attributes", async () => {
    const element = document.createElement("emb-tab-panel") as EmbTabPanel;
    element.label = "Overview";
    element.value = "overview";

    document.body.append(element);
    await element.updateComplete;

    expect(element.getAttribute("label")).toBe("Overview");
    expect(element.getAttribute("value")).toBe("overview");
  });
});
