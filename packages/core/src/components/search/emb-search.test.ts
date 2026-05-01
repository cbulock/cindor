import "../../register.js";

import { EmbSearch } from "./emb-search.js";

describe("emb-search", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

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

  it("keeps the search icon while supporting reset and aria forwarding", async () => {
    const element = document.createElement("emb-search") as EmbSearch;
    element.setAttribute("value", "button");
    element.value = "button";
    element.autocomplete = "off";
    element.setAttribute("aria-label", "Search components");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(input.autocomplete).toBe("off");
    expect(input.getAttribute("aria-label")).toBe("Search components");
    expect(element.renderRoot.querySelector("emb-icon")?.getAttribute("name")).toBe("search");

    input.value = "dialog";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("dialog");

    element.formResetCallback();
    await element.updateComplete;

    expect(element.value).toBe("button");
    expect(input.value).toBe("button");
  });
});
