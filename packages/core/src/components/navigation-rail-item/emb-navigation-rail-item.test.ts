import "../../register.js";

import { EmbNavigationRailItem } from "./emb-navigation-rail-item.js";

describe("emb-navigation-rail-item", () => {
  it("renders current-page semantics on links", async () => {
    const element = document.createElement("emb-navigation-rail-item") as EmbNavigationRailItem;
    element.href = "#home";
    element.current = true;
    element.label = "Home";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector(".item")?.getAttribute("aria-current")).toBe("page");
  });
});
