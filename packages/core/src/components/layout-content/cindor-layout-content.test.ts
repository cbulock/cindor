import "../../register.js";

import { CindorLayoutContent } from "./cindor-layout-content.js";

describe("cindor-layout-content", () => {
  it("renders slotted content inside a section region", async () => {
    const element = document.createElement("cindor-layout-content") as CindorLayoutContent;
    element.innerHTML = "<p>Primary content</p>";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("section")).not.toBeNull();
    expect(element.textContent).toContain("Primary content");
  });
});
