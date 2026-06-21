import "../../register.js";

import { CindorTreeView } from "./cindor-tree-view.js";

describe("cindor-tree-view", () => {
  it("defaults to the first enabled visible item", async () => {
    const element = document.createElement("cindor-tree-view") as CindorTreeView;
    element.innerHTML = `
      <cindor-tree-item label="Overview"></cindor-tree-item>
      <cindor-tree-item label="Settings"></cindor-tree-item>
    `;
    document.body.append(element);
    await element.updateComplete;

    expect(element.value).toBe("Overview");
  });

  it("marks the active item as selected for assistive technology on first render", async () => {
    const element = document.createElement("cindor-tree-view") as CindorTreeView;
    element.innerHTML = `
      <cindor-tree-item label="Overview"></cindor-tree-item>
      <cindor-tree-item label="Settings"></cindor-tree-item>
    `;
    document.body.append(element);
    await element.updateComplete;

    const firstItem = element.querySelector('cindor-tree-item[label="Overview"]') as HTMLElement;
    const secondItem = element.querySelector('cindor-tree-item[label="Settings"]') as HTMLElement;
    const firstButton = firstItem.shadowRoot?.querySelector('[part="item"]') as HTMLButtonElement;
    const secondButton = secondItem.shadowRoot?.querySelector('[part="item"]') as HTMLButtonElement;

    expect(firstButton.getAttribute("aria-selected")).toBe("true");
    expect(secondButton.getAttribute("aria-selected")).toBe("false");
  });

  it("moves selection with arrow keys through visible items", async () => {
    const element = document.createElement("cindor-tree-view") as CindorTreeView;
    element.innerHTML = `
      <cindor-tree-item label="Overview"></cindor-tree-item>
      <cindor-tree-item expanded label="Guides">
        <cindor-tree-item label="Getting started"></cindor-tree-item>
      </cindor-tree-item>
    `;
    document.body.append(element);
    await element.updateComplete;

    const firstItem = element.querySelector('cindor-tree-item[label="Overview"]') as HTMLElement;
    const firstButton = firstItem.shadowRoot?.querySelector('[part="item"]') as HTMLButtonElement;
    firstButton.focus();
    firstButton.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "ArrowDown" }));
    await element.updateComplete;

    expect(element.value).toBe("Guides");
  });

  it("promotes selection to the nearest visible ancestor when a selected branch collapses", async () => {
    const element = document.createElement("cindor-tree-view") as CindorTreeView;
    element.innerHTML = `
      <cindor-tree-item label="Overview"></cindor-tree-item>
      <cindor-tree-item expanded label="Guides">
        <cindor-tree-item label="Getting started"></cindor-tree-item>
      </cindor-tree-item>
    `;
    document.body.append(element);
    await element.updateComplete;

    element.value = "Getting started";
    await element.updateComplete;

    const guides = element.querySelector('cindor-tree-item[label="Guides"]') as CindorTreeItem;
    guides.toggle(false);
    await element.updateComplete;

    expect(element.value).toBe("Guides");
  });

  it("expands a collapsed branch with ArrowRight", async () => {
    const element = document.createElement("cindor-tree-view") as CindorTreeView;
    element.innerHTML = `
      <cindor-tree-item label="Overview"></cindor-tree-item>
      <cindor-tree-item label="Guides">
        <cindor-tree-item label="Getting started"></cindor-tree-item>
      </cindor-tree-item>
    `;
    document.body.append(element);
    await element.updateComplete;

    element.value = "Guides";
    await element.updateComplete;

    const guides = element.querySelector('cindor-tree-item[label="Guides"]') as HTMLElement;
    const guidesButton = guides.shadowRoot?.querySelector('[part="item"]') as HTMLButtonElement;
    guidesButton.focus();
    guidesButton.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "ArrowRight" }));
    await element.updateComplete;

    expect((guides as CindorTreeItem).expanded).toBe(true);
  });
});
