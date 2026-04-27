import "../../register.js";

import { EmbDropdownMenu } from "./emb-dropdown-menu.js";

describe("emb-dropdown-menu", () => {
  it("renders a menu surface with menu semantics", async () => {
    const element = document.createElement("emb-dropdown-menu") as EmbDropdownMenu;
    element.open = true;
    element.innerHTML = '<button slot="trigger">Menu</button><emb-menu-item>Item</emb-menu-item>';
    document.body.append(element);
    await element.updateComplete;
    await Promise.resolve();

    expect(element.renderRoot.querySelector('[part="menu"]')).not.toBeNull();
    expect(element.renderRoot.querySelector('[role="menu"]')).not.toBeNull();
  });

  it("closes when a menu item is selected", async () => {
    const element = document.createElement("emb-dropdown-menu") as EmbDropdownMenu;
    element.open = true;
    element.innerHTML = '<button slot="trigger">Menu</button><emb-menu-item>Item</emb-menu-item>';
    document.body.append(element);
    await element.updateComplete;

    const menuItem = element.querySelector("emb-menu-item") as HTMLElement;
    menuItem.click();
    await element.updateComplete;

    expect(element.open).toBe(false);
  });
});
