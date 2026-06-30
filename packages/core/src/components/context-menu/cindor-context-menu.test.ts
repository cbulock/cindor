import "../../register.js";

import { CindorContextMenu } from "./cindor-context-menu.js";

describe("cindor-context-menu", () => {
  it("opens at pointer coordinates on context menu events", async () => {
    const element = document.createElement("cindor-context-menu") as CindorContextMenu;
    element.innerHTML = '<button slot="trigger">Open</button><cindor-menu-item>Rename</cindor-menu-item>';
    document.body.append(element);
    await element.updateComplete;

    const trigger = element.querySelector('[slot="trigger"]') as HTMLElement;
    trigger.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, clientX: 80, clientY: 96, composed: true }));
    await element.updateComplete;

    expect(element.open).toBe(true);
    expect((element.renderRoot.querySelector('[part="menu"]') as HTMLElement).style.left).toBeTruthy();
  });

  it("closes when a menu item is selected", async () => {
    const element = document.createElement("cindor-context-menu") as CindorContextMenu;
    element.innerHTML = '<button slot="trigger">Open</button><cindor-menu-item>Rename</cindor-menu-item>';
    document.body.append(element);
    element.openAt(32, 48);
    await element.updateComplete;

    (element.querySelector("cindor-menu-item") as HTMLElement).click();
    await element.updateComplete;

    expect(element.open).toBe(false);
  });

  it("closes on Escape", async () => {
    const element = document.createElement("cindor-context-menu") as CindorContextMenu;
    element.innerHTML = '<button slot="trigger">Open</button><cindor-menu-item>Rename</cindor-menu-item>';
    document.body.append(element);
    element.openAt(32, 48);
    await element.updateComplete;

    const menu = element.renderRoot.querySelector('[part="menu"]') as HTMLElement;
    menu.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "Escape" }));
    await element.updateComplete;

    expect(element.open).toBe(false);
  });

  it("forwards host accessible naming to the internal menu", async () => {
    const element = document.createElement("cindor-context-menu") as CindorContextMenu;
    element.setAttribute("aria-label", "Context actions");
    element.innerHTML = '<button slot="trigger">Open</button><cindor-menu-item>Rename</cindor-menu-item>';
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[role="menu"]')?.getAttribute("aria-label")).toBe("Context actions");
  });

  it("applies menu relationships to a native trigger without wrapping it in a second button", async () => {
    const element = document.createElement("cindor-context-menu") as CindorContextMenu;
    element.innerHTML = '<button slot="trigger">Open</button><cindor-menu-item>Rename</cindor-menu-item>';
    document.body.append(element);
    await element.updateComplete;

    const trigger = element.querySelector('[slot="trigger"]') as HTMLButtonElement;
    const wrapper = element.renderRoot.querySelector('[part="trigger"]') as HTMLElement;

    expect(wrapper.getAttribute("role")).toBeNull();
    expect(wrapper.getAttribute("tabindex")).toBeNull();
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-controls")).toBeTruthy();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    trigger.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "Enter" }));
    await element.updateComplete;

    expect(element.open).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("synthesizes button semantics only for non-interactive triggers", async () => {
    const element = document.createElement("cindor-context-menu") as CindorContextMenu;
    element.innerHTML = '<span slot="trigger">Open</span><cindor-menu-item>Rename</cindor-menu-item>';
    document.body.append(element);
    await element.updateComplete;

    const trigger = element.querySelector('[slot="trigger"]') as HTMLElement;

    expect(trigger.getAttribute("role")).toBe("button");
    expect(trigger.getAttribute("tabindex")).toBe("0");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-controls")).toBeTruthy();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    trigger.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "Enter" }));
    await element.updateComplete;

    expect(element.open).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });
});
