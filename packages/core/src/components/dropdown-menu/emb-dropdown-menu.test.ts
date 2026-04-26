import "../../register.js";

import { EmbDropdownMenu } from "./emb-dropdown-menu.js";

describe("emb-dropdown-menu", () => {
  it("renders a menu surface", async () => {
    const element = document.createElement("emb-dropdown-menu") as EmbDropdownMenu;
    element.open = true;
    element.innerHTML = '<button slot="trigger">Menu</button><button type="button">Item</button>';
    document.body.append(element);
    await element.updateComplete;
    await Promise.resolve();

    expect(element.renderRoot.querySelector('[role="menu"]')).not.toBeNull();
  });
});
