import "../../register.js";

import { EmbAccordion } from "./emb-accordion.js";

describe("emb-accordion", () => {
  it("syncs open state from the native details element", async () => {
    const element = document.createElement("emb-accordion") as EmbAccordion;
    element.innerHTML = `<span slot="summary">Filters</span><p>Body</p>`;
    document.body.append(element);
    await element.updateComplete;

    const details = element.renderRoot.querySelector("details");
    expect(details).not.toBeNull();

    details!.open = true;
    details!.dispatchEvent(new Event("toggle"));
    await element.updateComplete;

    expect(element.open).toBe(true);
  });
});
