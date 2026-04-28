import "../../register.js";

import { EmbSideNav } from "./emb-side-nav.js";

describe("emb-side-nav", () => {
  it("renders a navigation landmark", async () => {
    const element = document.createElement("emb-side-nav") as EmbSideNav;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('nav[aria-label="Side navigation"]')).not.toBeNull();
  });

  it("moves focus through visible items with arrow keys", async () => {
    const element = document.createElement("emb-side-nav") as EmbSideNav;
    element.innerHTML = `
      <emb-side-nav-item href="#overview" label="Overview"></emb-side-nav-item>
      <emb-side-nav-item expanded label="Guides">
        <emb-side-nav-item href="#getting-started" label="Getting started"></emb-side-nav-item>
      </emb-side-nav-item>
    `;
    document.body.append(element);
    await element.updateComplete;

    const firstItem = element.querySelector('emb-side-nav-item[label="Overview"]') as HTMLElement;
    const firstControl = firstItem.shadowRoot?.querySelector('[part="item"]') as HTMLAnchorElement;
    firstControl.focus();
    firstControl.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "ArrowDown" }));
    await element.updateComplete;

    const secondItem = element.querySelector('emb-side-nav-item[label="Guides"]') as HTMLElement;
    expect(secondItem.shadowRoot?.activeElement?.getAttribute("part")).toBe("item");
  });
});
