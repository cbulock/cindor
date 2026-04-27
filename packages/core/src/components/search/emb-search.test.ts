import "../../register.js";

import { EmbSearch } from "./emb-search.js";

describe("emb-search", () => {
  it("renders a native search input", async () => {
    const element = document.createElement("emb-search") as EmbSearch;
    element.value = "button";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");
    const icon = element.renderRoot.querySelector("emb-icon");

    expect(input?.value).toBe("button");
    expect(input?.getAttribute("type")).toBe("search");
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute("name")).toBe("search");
  });
});
