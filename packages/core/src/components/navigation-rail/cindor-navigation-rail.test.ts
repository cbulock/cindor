import "../../register.js";

import { CindorNavigationRail } from "./cindor-navigation-rail.js";

describe("cindor-navigation-rail", () => {
  it("renders navigation landmark labeling", async () => {
    const element = document.createElement("cindor-navigation-rail") as CindorNavigationRail;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("nav")?.getAttribute("aria-label")).toBe("Navigation rail");
  });
});
