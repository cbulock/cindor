import "../../register.js";

import { CindorSearch } from "./cindor-search.js";

describe("cindor-search", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders a native search input", async () => {
    const element = document.createElement("cindor-search") as CindorSearch;
    element.value = "button";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");
    const icon = element.renderRoot.querySelector("cindor-icon");

    expect(input?.value).toBe("button");
    expect(input?.getAttribute("type")).toBe("search");
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute("name")).toBe("search");
  });

  it("keeps the search icon while supporting reset and aria forwarding", async () => {
    const element = document.createElement("cindor-search") as CindorSearch;
    element.setAttribute("value", "button");
    element.value = "button";
    element.autocomplete = "off";
    element.setAttribute("aria-label", "Search components");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(input.autocomplete).toBe("off");
    expect(input.getAttribute("aria-label")).toBe("Search components");
    expect(element.renderRoot.querySelector("cindor-icon")?.getAttribute("name")).toBe("search");

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
