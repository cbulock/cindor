import "../../register.js";

import { CindorMenuItem } from "./cindor-menu-item.js";

describe("cindor-menu-item", () => {
  it("emits a selection event when clicked", async () => {
    const element = document.createElement("cindor-menu-item") as CindorMenuItem;
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
