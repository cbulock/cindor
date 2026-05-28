import "../../register.js";

import { CindorDataViewToolbar } from "./cindor-data-view-toolbar.js";

describe("cindor-data-view-toolbar", () => {
  it("renders title, counts, and slotted controls", async () => {
    const element = document.createElement("cindor-data-view-toolbar") as CindorDataViewToolbar;
    element.title = "Projects";
    element.description = "Review and update the current collection.";
    element.itemCount = 128;
    element.selectionCount = 3;
    element.innerHTML = `
      <cindor-badge slot="meta">Active</cindor-badge>
      <cindor-search slot="filters"></cindor-search>
      <cindor-button slot="actions">Create project</cindor-button>
    `;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="title"]')?.textContent).toContain("Projects");
    expect(element.renderRoot.querySelector('[part="item-count"]')?.textContent).toContain("128");
    expect(element.renderRoot.querySelector('[part="selection-count"]')?.textContent).toContain("3");
    expect(element.querySelector('[slot="actions"]')?.textContent).toContain("Create project");
  });

  it("uses the title as the accessible region label by default", async () => {
    const element = document.createElement("cindor-data-view-toolbar") as CindorDataViewToolbar;
    element.title = "Projects";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="surface"]')?.getAttribute("aria-label")).toBe("Projects");
  });

  it("prefers an explicit aria-label when provided", async () => {
    const element = document.createElement("cindor-data-view-toolbar") as CindorDataViewToolbar;
    element.title = "Projects";
    element.setAttribute("aria-label", "Project collection controls");
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="surface"]')?.getAttribute("aria-label")).toBe("Project collection controls");
  });
});
