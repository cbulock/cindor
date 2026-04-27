import "../../register.js";

import { EmbTreeView } from "./emb-tree-view.js";

describe("emb-tree-view", () => {
  it("defaults to the first enabled visible item", async () => {
    const element = document.createElement("emb-tree-view") as EmbTreeView;
    element.innerHTML = `
      <emb-tree-item label="Overview"></emb-tree-item>
      <emb-tree-item label="Settings"></emb-tree-item>
    `;
    document.body.append(element);
    await element.updateComplete;

    expect(element.value).toBe("Overview");
  });

  it("marks the active item as selected for assistive technology on first render", async () => {
    const element = document.createElement("emb-tree-view") as EmbTreeView;
    element.innerHTML = `
      <emb-tree-item label="Overview"></emb-tree-item>
      <emb-tree-item label="Settings"></emb-tree-item>
    `;
    document.body.append(element);
    await element.updateComplete;

    const firstItem = element.querySelector('emb-tree-item[label="Overview"]') as HTMLElement;
    const secondItem = element.querySelector('emb-tree-item[label="Settings"]') as HTMLElement;
    const firstButton = firstItem.shadowRoot?.querySelector('[part="item"]') as HTMLButtonElement;
    const secondButton = secondItem.shadowRoot?.querySelector('[part="item"]') as HTMLButtonElement;

    expect(firstButton.getAttribute("aria-selected")).toBe("true");
    expect(secondButton.getAttribute("aria-selected")).toBe("false");
  });

  it("moves selection with arrow keys through visible items", async () => {
    const element = document.createElement("emb-tree-view") as EmbTreeView;
    element.innerHTML = `
      <emb-tree-item label="Overview"></emb-tree-item>
      <emb-tree-item expanded label="Guides">
        <emb-tree-item label="Getting started"></emb-tree-item>
      </emb-tree-item>
    `;
    document.body.append(element);
    await element.updateComplete;

    const firstItem = element.querySelector('emb-tree-item[label="Overview"]') as HTMLElement;
    const firstButton = firstItem.shadowRoot?.querySelector('[part="item"]') as HTMLButtonElement;
    firstButton.focus();
    firstButton.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "ArrowDown" }));
    await element.updateComplete;

    expect(element.value).toBe("Guides");
  });
});
