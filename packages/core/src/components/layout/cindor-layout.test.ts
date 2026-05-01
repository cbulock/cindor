import "../../register.js";

import { CindorLayout } from "./cindor-layout.js";

describe("cindor-layout", () => {
  it("renders a layout surface for slotted regions", async () => {
    const element = document.createElement("cindor-layout") as CindorLayout;
    element.innerHTML = "<section>Overview</section><section>Details</section>";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="layout"]')).not.toBeNull();
    expect(element.textContent).toContain("Overview");
  });
});
