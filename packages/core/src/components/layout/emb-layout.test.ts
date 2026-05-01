import "../../register.js";

import { EmbLayout } from "./emb-layout.js";

describe("emb-layout", () => {
  it("renders a layout surface for slotted regions", async () => {
    const element = document.createElement("emb-layout") as EmbLayout;
    element.innerHTML = "<section>Overview</section><section>Details</section>";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="layout"]')).not.toBeNull();
    expect(element.textContent).toContain("Overview");
  });
});
