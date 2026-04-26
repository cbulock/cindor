import "../../register.js";

import { EmbIcon } from "./emb-icon.js";

describe("emb-icon", () => {
  it("renders a Lucide icon with accessible labelling", async () => {
    const element = document.createElement("emb-icon") as EmbIcon;
    element.name = "search";
    element.label = "Search";
    element.size = 18;
    element.strokeWidth = 1.5;
    document.body.append(element);
    await element.updateComplete;

    const icon = element.renderRoot.querySelector("svg");

    expect(icon?.getAttribute("aria-label")).toBe("Search");
    expect(icon?.getAttribute("width")).toBe("18");
    expect(icon?.getAttribute("stroke-width")).toBe("1.5");
    expect(icon?.querySelector("circle")).not.toBeNull();
  });
});
