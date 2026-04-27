import "../../register.js";

import { EmbDrawer } from "./emb-drawer.js";

describe("emb-drawer", () => {
  it("closes from the keyboard escape shortcut", async () => {
    const element = document.createElement("emb-drawer") as EmbDrawer;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const panel = element.renderRoot.querySelector('[part="panel"]') as HTMLElement;
    panel.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await element.updateComplete;

    expect(element.open).toBe(false);
  });

  it("restores focus to the previously focused element when closing", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open drawer";
    document.body.append(trigger);
    trigger.focus();

    const element = document.createElement("emb-drawer") as EmbDrawer;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;
    await Promise.resolve();

    element.close();
    await element.updateComplete;

    expect(document.activeElement).toBe(trigger);
  });

  it("closes when the backdrop is clicked", async () => {
    const element = document.createElement("emb-drawer") as EmbDrawer;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const backdrop = element.renderRoot.querySelector(".backdrop");
    const closeButton = element.renderRoot.querySelector('[part="close-button"]');
    backdrop!.dispatchEvent(new Event("click"));
    await element.updateComplete;

    expect(closeButton).not.toBeNull();
    expect(element.open).toBe(false);
  });

  it("closes from the built-in close button", async () => {
    const element = document.createElement("emb-drawer") as EmbDrawer;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const closeButton = element.renderRoot.querySelector('[part="close-button"]') as HTMLElement;
    closeButton.dispatchEvent(new Event("click", { bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.open).toBe(false);
  });

  it("renders dialog semantics when open", async () => {
    const element = document.createElement("emb-drawer") as EmbDrawer;
    element.open = true;
    element.setAttribute("aria-label", "Filters");
    document.body.append(element);
    await element.updateComplete;

    const panel = element.renderRoot.querySelector('[part="panel"]');

    expect(panel?.getAttribute("role")).toBe("dialog");
    expect(panel?.getAttribute("aria-modal")).toBe("true");
    expect(panel?.getAttribute("aria-label")).toBe("Filters");
  });
});
