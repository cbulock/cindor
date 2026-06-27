import "../../register.js";

import { CindorWorkspaceSwitcher, type WorkspaceSwitcherItem } from "./cindor-workspace-switcher.js";

const items: WorkspaceSwitcherItem[] = [
  {
    value: "ops",
    label: "Operations hub",
    description: "Deployments and incidents",
    meta: "Production",
    group: "Pinned"
  },
  {
    value: "design",
    label: "Design systems",
    description: "Shared tokens and primitives",
    meta: "Shared",
    group: "Pinned"
  },
  {
    value: "launch",
    label: "Q3 launch",
    description: "Approvals and checklist",
    meta: "Recent",
    group: "Recent"
  }
];

describe("cindor-workspace-switcher", () => {
  it("renders the current item in the trigger", async () => {
    const element = document.createElement("cindor-workspace-switcher") as CindorWorkspaceSwitcher;
    element.items = items;
    element.value = "ops";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="trigger-label"]')?.textContent).toContain("Operations hub");
    expect(element.renderRoot.querySelector('[part="trigger-meta"]')?.textContent).toContain("Production");
  });

  it("filters items and selects the active result with the keyboard", async () => {
    const element = document.createElement("cindor-workspace-switcher") as CindorWorkspaceSwitcher;
    element.items = items;
    element.value = "ops";
    const changeListener = vi.fn();
    const selectListener = vi.fn();
    element.addEventListener("change", changeListener);
    element.addEventListener("select", selectListener);
    document.body.append(element);
    await element.updateComplete;

    (element.renderRoot.querySelector('[part="trigger"]') as HTMLButtonElement).click();
    await element.updateComplete;

    const search = element.renderRoot.querySelector('[part="search"]') as HTMLInputElement;
    search.value = "launch";
    search.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    await element.updateComplete;

    search.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "ArrowDown" }));
    search.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "Enter" }));
    await element.updateComplete;

    expect(element.value).toBe("launch");
    expect(changeListener).toHaveBeenCalledTimes(1);
    expect(selectListener.mock.calls.at(-1)?.[0].detail.value).toBe("launch");
    expect(element.open).toBe(false);
  });

  it("closes on Escape and restores focus to the trigger", async () => {
    const element = document.createElement("cindor-workspace-switcher") as CindorWorkspaceSwitcher;
    element.items = items;
    document.body.append(element);
    await element.updateComplete;

    const trigger = element.renderRoot.querySelector('[part="trigger"]') as HTMLButtonElement;
    trigger.click();
    await element.updateComplete;

    const search = element.renderRoot.querySelector('[part="search"]') as HTMLInputElement;
    search.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "Escape" }));
    await element.updateComplete;

    expect(element.open).toBe(false);
    expect(document.activeElement).toBe(element);
    expect(element.shadowRoot?.activeElement).toBe(trigger);
  });

  it("renders the empty state when filtering removes every item", async () => {
    const element = document.createElement("cindor-workspace-switcher") as CindorWorkspaceSwitcher;
    element.items = items;
    document.body.append(element);
    await element.updateComplete;

    (element.renderRoot.querySelector('[part="trigger"]') as HTMLButtonElement).click();
    await element.updateComplete;

    const search = element.renderRoot.querySelector('[part="search"]') as HTMLInputElement;
    search.value = "does-not-match";
    search.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="empty"]')?.textContent).toContain("No workspaces match your search.");
  });
});
