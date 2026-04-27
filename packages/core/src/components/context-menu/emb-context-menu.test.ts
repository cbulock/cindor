import "../../register.js";

import { EmbContextMenu } from "./emb-context-menu.js";

describe("emb-context-menu", () => {
  it("opens at pointer coordinates on context menu events", async () => {
    const element = document.createElement("emb-context-menu") as EmbContextMenu;
    element.innerHTML = '<button slot="trigger">Open</button><emb-menu-item>Rename</emb-menu-item>';
    document.body.append(element);
    await element.updateComplete;

    const trigger = element.querySelector('[slot="trigger"]') as HTMLElement;
    trigger.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, clientX: 80, clientY: 96, composed: true }));
    await element.updateComplete;

    expect(element.open).toBe(true);
    expect((element.renderRoot.querySelector('[part="menu"]') as HTMLElement).style.left).toBeTruthy();
  });

  it("closes when a menu item is selected", async () => {
    const element = document.createElement("emb-context-menu") as EmbContextMenu;
    element.innerHTML = '<button slot="trigger">Open</button><emb-menu-item>Rename</emb-menu-item>';
    document.body.append(element);
    element.openAt(32, 48);
    await element.updateComplete;

    (element.querySelector("emb-menu-item") as HTMLElement).click();
    await element.updateComplete;

    expect(element.open).toBe(false);
  });

  it("closes on Escape", async () => {
    const element = document.createElement("emb-context-menu") as EmbContextMenu;
    element.innerHTML = '<button slot="trigger">Open</button><emb-menu-item>Rename</emb-menu-item>';
    document.body.append(element);
    element.openAt(32, 48);
    await element.updateComplete;

    const menu = element.renderRoot.querySelector('[part="menu"]') as HTMLElement;
    menu.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "Escape" }));
    await element.updateComplete;

    expect(element.open).toBe(false);
  });
});
