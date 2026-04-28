import "../../register.js";

import { EmbCommandBar } from "./emb-command-bar.js";

describe("emb-command-bar", () => {
  it("renders the summary label, count, and slotted actions", async () => {
    const element = document.createElement("emb-command-bar") as EmbCommandBar;
    element.label = "Bulk actions";
    element.description = "Apply changes to the current selection.";
    element.count = 3;
    element.innerHTML = '<emb-button slot="actions">Archive</emb-button>';
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="label"]')?.textContent).toContain("Bulk actions");
    expect(element.renderRoot.querySelector('[part="count"]')?.textContent).toContain("3");
    expect(element.querySelector('[slot="actions"]')?.textContent).toContain("Archive");
  });
});
