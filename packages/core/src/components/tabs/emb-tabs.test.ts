import "../../register.js";

import { EmbTabs } from "./emb-tabs.js";

describe("emb-tabs", () => {
  it("selects the first panel by default and switches on click", async () => {
    const element = document.createElement("emb-tabs") as EmbTabs;
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
    const element = document.createElement("emb-tabs") as EmbTabs;
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
    const element = document.createElement("emb-tabs") as EmbTabs;
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
    const element = document.createElement("emb-tabs") as EmbTabs;
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
});
