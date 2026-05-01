import "../../register.js";

import { CindorCommandBar } from "./cindor-command-bar.js";

describe("cindor-command-bar", () => {
  it("renders the summary label, count, and slotted actions", async () => {
    const element = document.createElement("cindor-command-bar") as CindorCommandBar;
    element.label = "Bulk actions";
    element.description = "Apply changes to the current selection.";
    element.count = 3;
    element.innerHTML = '<cindor-button slot="actions">Archive</cindor-button>';
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="label"]')?.textContent).toContain("Bulk actions");
    expect(element.renderRoot.querySelector('[part="count"]')?.textContent).toContain("3");
    expect(element.querySelector('[slot="actions"]')?.textContent).toContain("Archive");
  });
});
