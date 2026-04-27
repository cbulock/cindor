import "../../register.js";

import { EmbTreeItem } from "./emb-tree-item.js";

describe("emb-tree-item", () => {
  it("toggles nested content when the branch control is activated", async () => {
    const element = document.createElement("emb-tree-item") as EmbTreeItem;
    element.label = "Parent";
    element.innerHTML = `<emb-tree-item label="Child"></emb-tree-item>`;
    document.body.append(element);
    await element.updateComplete;

    const toggle = element.renderRoot.querySelector('[part="toggle"]') as HTMLButtonElement;
    toggle.click();
    await element.updateComplete;

    expect(element.expanded).toBe(true);
  });

  it("emits a selection event when the row is clicked", async () => {
    const element = document.createElement("emb-tree-item") as EmbTreeItem;
    element.label = "Overview";
    document.body.append(element);
    await element.updateComplete;

    const selectionSpy = vi.fn();
    element.addEventListener("tree-item-select", selectionSpy);

    (element.renderRoot.querySelector('[part="item"]') as HTMLButtonElement).click();

    expect(selectionSpy).toHaveBeenCalledTimes(1);
  });
});
