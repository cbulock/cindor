import "../../register.js";

import { CindorDropdownMenu } from "./cindor-dropdown-menu.js";

describe("cindor-dropdown-menu", () => {
  it("renders a menu surface with menu semantics", async () => {
    const element = document.createElement("cindor-dropdown-menu") as CindorDropdownMenu;
    element.open = true;
    element.innerHTML = '<button slot="trigger">Menu</button><cindor-menu-item>Item</cindor-menu-item>';
    document.body.append(element);
    await element.updateComplete;
    await Promise.resolve();

    expect(element.renderRoot.querySelector('[part="menu"]')).not.toBeNull();
    expect(element.renderRoot.querySelector('[role="menu"]')).not.toBeNull();
  });

  it("forwards host accessible naming to the internal menu", async () => {
    const element = document.createElement("cindor-dropdown-menu") as CindorDropdownMenu;
    element.open = true;
    element.setAttribute("aria-label", "Project actions");
    element.innerHTML = '<button slot="trigger">Menu</button><cindor-menu-item>Item</cindor-menu-item>';
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[role="menu"]')?.getAttribute("aria-label")).toBe("Project actions");
  });

  it("closes when a menu item is selected", async () => {
    const element = document.createElement("cindor-dropdown-menu") as CindorDropdownMenu;
    element.open = true;
    element.innerHTML = '<button slot="trigger">Menu</button><cindor-menu-item>Item</cindor-menu-item>';
    document.body.append(element);
    await element.updateComplete;

    const menuItem = element.querySelector("cindor-menu-item") as HTMLElement;
    menuItem.click();
    await element.updateComplete;

    expect(element.open).toBe(false);
  });
});
