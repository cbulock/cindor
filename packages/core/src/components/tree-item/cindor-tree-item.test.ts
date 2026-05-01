import "../../register.js";

import { CindorTreeItem } from "./cindor-tree-item.js";

describe("cindor-tree-item", () => {
  it("toggles nested content when the branch control is activated", async () => {
    const element = document.createElement("cindor-tree-item") as CindorTreeItem;
    element.label = "Parent";
    element.innerHTML = `<cindor-tree-item label="Child"></cindor-tree-item>`;
    document.body.append(element);
    await element.updateComplete;

    const toggle = element.renderRoot.querySelector('[part="toggle"]') as HTMLButtonElement;
    toggle.click();
    await element.updateComplete;

    expect(element.expanded).toBe(true);
  });

  it("emits a selection event when the row is clicked", async () => {
    const element = document.createElement("cindor-tree-item") as CindorTreeItem;
    element.label = "Overview";
    document.body.append(element);
    await element.updateComplete;

    const selectionSpy = vi.fn();
    element.addEventListener("tree-item-select", selectionSpy);

    (element.renderRoot.querySelector('[part="item"]') as HTMLButtonElement).click();

    expect(selectionSpy).toHaveBeenCalledTimes(1);
  });
});
