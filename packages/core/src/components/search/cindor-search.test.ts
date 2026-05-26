import "../../register.js";

import { CindorSearch } from "./cindor-search.js";

describe("cindor-search", () => {
  async function waitForSearchIcon(element: CindorSearch): Promise<SVGElement | null> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await element.updateComplete;
      const icon = element.renderRoot.querySelector("cindor-icon") as HTMLElement | null;
      const svg = icon?.shadowRoot?.querySelector("svg") ?? null;
      if (svg) {
        return svg;
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
    }

    return element.renderRoot.querySelector("cindor-icon")?.shadowRoot?.querySelector("svg") ?? null;
  }

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
    const svg = await waitForSearchIcon(element);

    expect(input?.value).toBe("button");
    expect(input?.getAttribute("type")).toBe("search");
    expect(icon).not.toBeNull();
    expect(svg).not.toBeNull();
    expect(icon?.getAttribute("name")).toBe("search");
    expect(icon?.classList.contains("end-icon")).toBe(true);
    expect(icon?.classList.contains("start-icon")).toBe(false);
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
    const labelElement = element.renderRoot.querySelector(`label[for="${input.id}"]`) as HTMLLabelElement | null;
    const svg = await waitForSearchIcon(element);

    expect(input.autocomplete).toBe("off");
    expect(input.hasAttribute("aria-labelledby")).toBe(false);
    expect(labelElement?.id).toMatch(/-label$/);
    expect(labelElement?.textContent?.trim()).toBe("Search components");
    expect(svg).not.toBeNull();
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
