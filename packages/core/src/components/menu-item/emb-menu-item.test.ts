import "../../register.js";

import { EmbMenuItem } from "./emb-menu-item.js";

describe("emb-menu-item", () => {
  it("emits a selection event when clicked", async () => {
    const element = document.createElement("emb-menu-item") as EmbMenuItem;
    element.textContent = "Edit";
    document.body.append(element);
    await element.updateComplete;

    const selected = vi.fn();
    element.addEventListener("menu-item-select", selected);

    element.click();

    expect(selected).toHaveBeenCalledTimes(1);
    expect(element.getAttribute("role")).toBe("menuitem");
  });
});
