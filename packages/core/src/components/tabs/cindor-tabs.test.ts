import "../../register.js";

import { CindorTabs } from "./cindor-tabs.js";

describe("cindor-tabs", () => {
  it("selects the first panel by default and switches on click", async () => {
    const element = document.createElement("cindor-tabs") as CindorTabs;
    element.innerHTML = `
      <section data-label="Overview" data-value="overview">Overview body</section>
      <section data-label="Activity" data-value="activity">Activity body</section>
    `;

    document.body.append(element);
    await element.updateComplete;

    const tabs = element.renderRoot.querySelectorAll('button[role="tab"]');

    expect(element.value).toBe("overview");
    expect((element.children[0] as HTMLElement).hidden).toBe(false);
    expect((element.children[1] as HTMLElement).hidden).toBe(true);

    tabs[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("activity");
    expect((element.children[0] as HTMLElement).hidden).toBe(true);
    expect((element.children[1] as HTMLElement).hidden).toBe(false);
  });

  it("refreshes tab metadata when light DOM panels change", async () => {
    const element = document.createElement("cindor-tabs") as CindorTabs;
    element.innerHTML = `
      <section data-label="Overview" data-value="overview">Overview body</section>
      <section data-label="Activity" data-value="activity">Activity body</section>
    `;

    document.body.append(element);
    await element.updateComplete;

    const activityPanel = element.children[1] as HTMLElement;
    activityPanel.dataset.label = "Recent activity";
    activityPanel.textContent = "Updated activity body";
    await element.updateComplete;

    const tabs = Array.from(element.renderRoot.querySelectorAll('button[role="tab"]'));

    expect(tabs[1]?.textContent?.trim()).toBe("Recent activity");

    tabs[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await element.updateComplete;

    expect(activityPanel.hidden).toBe(false);
    expect(activityPanel.textContent).toContain("Updated activity body");
  });

  it("updates the visible panel when value changes externally", async () => {
    const element = document.createElement("cindor-tabs") as CindorTabs;
    element.innerHTML = `
      <section data-label="Overview" data-value="overview">Overview body</section>
      <section data-label="Activity" data-value="activity">Activity body</section>
      <section data-label="Settings" data-value="settings">Settings body</section>
    `;

    document.body.append(element);
    await element.updateComplete;

    element.value = "settings";
    await element.updateComplete;

    expect((element.children[0] as HTMLElement).hidden).toBe(true);
    expect((element.children[1] as HTMLElement).hidden).toBe(true);
    expect((element.children[2] as HTMLElement).hidden).toBe(false);
  });

  it("supports keyboard navigation across tabs", async () => {
    const element = document.createElement("cindor-tabs") as CindorTabs;
    element.innerHTML = `
      <section data-label="Overview" data-value="overview">Overview body</section>
      <section data-label="Activity" data-value="activity">Activity body</section>
      <section data-label="Settings" data-value="settings">Settings body</section>
    `;

    document.body.append(element);
    await element.updateComplete;

    const tabs = Array.from(element.renderRoot.querySelectorAll('button[role="tab"]')) as HTMLButtonElement[];
    tabs[0]?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }));
    await element.updateComplete;

    expect(element.value).toBe("activity");
    const shadowRoot = element.shadowRoot;
    expect(document.activeElement === tabs[1] || shadowRoot?.activeElement === tabs[1]).toBe(true);

    tabs[1]?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "End" }));
    await element.updateComplete;

    expect(element.value).toBe("settings");

    const updatedTabs = Array.from(element.renderRoot.querySelectorAll('button[role="tab"]')) as HTMLButtonElement[];
    updatedTabs[2]?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Home" }));
    await element.updateComplete;

    expect(element.value).toBe("overview");
  });

  it("forwards host accessibility naming to the internal tablist", async () => {
    const element = document.createElement("cindor-tabs") as CindorTabs;
    element.setAttribute("aria-label", "Project sections");
    element.innerHTML = `
      <section data-label="Overview" data-value="overview">Overview body</section>
      <section data-label="Activity" data-value="activity">Activity body</section>
    `;

    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[role="tablist"]')?.getAttribute("aria-label")).toBe("Project sections");
  });

  it("mirrors external tablist labels and descriptions into shadow-safe references", async () => {
    document.body.innerHTML = `
      <span id="tabs-label">Project sections</span>
      <span id="tabs-help">Use arrow keys to switch sections</span>
    `;

    const element = document.createElement("cindor-tabs") as CindorTabs;
    element.setAttribute("aria-labelledby", "tabs-label");
    element.setAttribute("aria-describedby", "tabs-help");
    element.innerHTML = `
      <section data-label="Overview" data-value="overview">Overview body</section>
      <section data-label="Activity" data-value="activity">Activity body</section>
    `;

    document.body.append(element);
    await element.updateComplete;

    const tablist = element.renderRoot.querySelector('[role="tablist"]') as HTMLElement;
    const labelledById = tablist.getAttribute("aria-labelledby");
    const describedById = tablist.getAttribute("aria-describedby");

    expect(labelledById).toMatch(/-label$/);
    expect(describedById).toMatch(/-description$/);
    expect(element.renderRoot.querySelector(`#${labelledById ?? ""}`)?.textContent).toBe("Project sections");
    expect(element.renderRoot.querySelector(`#${describedById ?? ""}`)?.textContent).toBe("Use arrow keys to switch sections");
  });

  it("keeps tab-to-panel relationships inside shadow-safe wrappers", async () => {
    const element = document.createElement("cindor-tabs") as CindorTabs;
    element.innerHTML = `
      <section id="overview-panel" data-label="Overview" data-value="overview">Overview body</section>
      <section id="activity-panel" data-label="Activity" data-value="activity">Activity body</section>
    `;

    document.body.append(element);
    await element.updateComplete;

    const tabs = Array.from(element.renderRoot.querySelectorAll('button[role="tab"]')) as HTMLButtonElement[];
    const tabPanels = Array.from(element.renderRoot.querySelectorAll('[role="tabpanel"]')) as HTMLElement[];

    expect(tabs[0]?.getAttribute("aria-controls")).toBe(tabPanels[0]?.id);
    expect(tabPanels[0]?.getAttribute("aria-labelledby")).toBe(tabs[0]?.id);
    expect((element.children[0] as HTMLElement).getAttribute("aria-labelledby")).toBeNull();
  });

  it("supports cindor-tab-panel children for explicit wrapper ergonomics", async () => {
    const element = document.createElement("cindor-tabs") as CindorTabs;
    element.innerHTML = `
      <cindor-tab-panel label="Overview" value="overview">Overview body</cindor-tab-panel>
      <cindor-tab-panel label="Activity" value="activity">Activity body</cindor-tab-panel>
    `;

    document.body.append(element);
    await element.updateComplete;

    const tabs = Array.from(element.renderRoot.querySelectorAll('button[role="tab"]'));
    expect(tabs[0]?.textContent?.trim()).toBe("Overview");
    expect(tabs[1]?.textContent?.trim()).toBe("Activity");

    tabs[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("activity");
    expect((element.children[0] as HTMLElement).hidden).toBe(true);
    expect((element.children[1] as HTMLElement).hidden).toBe(false);
  });
});
