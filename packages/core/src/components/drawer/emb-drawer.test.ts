import "../../register.js";

import { EmbDrawer } from "./emb-drawer.js";

describe("emb-drawer", () => {
  it("closes when the backdrop is clicked", async () => {
    const element = document.createElement("emb-drawer") as EmbDrawer;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const backdrop = element.renderRoot.querySelector(".backdrop");
    const closeIcon = element.renderRoot.querySelector('[part="close-icon"]');
    backdrop!.dispatchEvent(new Event("click"));
    await element.updateComplete;

    expect(closeIcon).not.toBeNull();
    expect(element.open).toBe(false);
  });
});
