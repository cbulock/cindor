import "../../register.js";

import { CindorNavigationRailItem } from "./cindor-navigation-rail-item.js";

describe("cindor-navigation-rail-item", () => {
  it("renders current-page semantics on links", async () => {
    const element = document.createElement("cindor-navigation-rail-item") as CindorNavigationRailItem;
    element.href = "#home";
    element.current = true;
    element.label = "Home";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector(".item")?.getAttribute("aria-current")).toBe("page");
  });
});
