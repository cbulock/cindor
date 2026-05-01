import "../../register.js";

import { CindorSideNavItem } from "./cindor-side-nav-item.js";

describe("cindor-side-nav-item", () => {
  it("renders links with current-page semantics", async () => {
    const element = document.createElement("cindor-side-nav-item") as CindorSideNavItem;
    element.href = "/docs";
    element.label = "Docs";
    element.current = true;
    document.body.append(element);
    await element.updateComplete;

    const link = element.renderRoot.querySelector('[part="item"]') as HTMLAnchorElement;
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("aria-current")).toBe("page");
  });

  it("toggles child visibility for grouped items", async () => {
    const element = document.createElement("cindor-side-nav-item") as CindorSideNavItem;
    element.label = "Guides";
    element.innerHTML = '<cindor-side-nav-item label="Getting started"></cindor-side-nav-item>';
    document.body.append(element);
    await element.updateComplete;

    (element.renderRoot.querySelector('[part="toggle"]') as HTMLButtonElement).click();
    await element.updateComplete;

    expect(element.expanded).toBe(true);
  });
});
