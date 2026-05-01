import "../../register.js";

import { CindorSideNav } from "./cindor-side-nav.js";

describe("cindor-side-nav", () => {
  it("renders a navigation landmark", async () => {
    const element = document.createElement("cindor-side-nav") as CindorSideNav;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('nav[aria-label="Side navigation"]')).not.toBeNull();
  });

  it("moves focus through visible items with arrow keys", async () => {
    const element = document.createElement("cindor-side-nav") as CindorSideNav;
    element.innerHTML = `
      <cindor-side-nav-item href="#overview" label="Overview"></cindor-side-nav-item>
      <cindor-side-nav-item expanded label="Guides">
        <cindor-side-nav-item href="#getting-started" label="Getting started"></cindor-side-nav-item>
      </cindor-side-nav-item>
    `;
    document.body.append(element);
    await element.updateComplete;

    const firstItem = element.querySelector('cindor-side-nav-item[label="Overview"]') as HTMLElement;
    const firstControl = firstItem.shadowRoot?.querySelector('[part="item"]') as HTMLAnchorElement;
    firstControl.focus();
    firstControl.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "ArrowDown" }));
    await element.updateComplete;

    const secondItem = element.querySelector('cindor-side-nav-item[label="Guides"]') as HTMLElement;
    expect(secondItem.shadowRoot?.activeElement?.getAttribute("part")).toBe("item");
  });
});
