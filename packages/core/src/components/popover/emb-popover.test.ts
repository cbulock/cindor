import "../../register.js";

import { EmbPopover } from "./emb-popover.js";

describe("emb-popover", () => {
  it("syncs open state from native details", async () => {
    const element = document.createElement("emb-popover") as EmbPopover;
    element.innerHTML = '<button slot="trigger">Open</button><p>Body</p>';
    document.body.append(element);
    await element.updateComplete;

    const details = element.renderRoot.querySelector("details");
    details!.open = true;
    details!.dispatchEvent(new Event("toggle"));
    await element.updateComplete;
    await Promise.resolve();

    expect(element.open).toBe(true);
  });
});
