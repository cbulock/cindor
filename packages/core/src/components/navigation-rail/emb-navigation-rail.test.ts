import "../../register.js";

import { EmbNavigationRail } from "./emb-navigation-rail.js";

describe("emb-navigation-rail", () => {
  it("renders navigation landmark labeling", async () => {
    const element = document.createElement("emb-navigation-rail") as EmbNavigationRail;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("nav")?.getAttribute("aria-label")).toBe("Navigation rail");
  });
});
