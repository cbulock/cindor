import "../../register.js";

import { EmbMenu } from "./emb-menu.js";

describe("emb-menu", () => {
  it("supports arrow-key focus movement across menu items", async () => {
    const element = document.createElement("emb-menu") as EmbMenu;
    element.innerHTML = '<emb-menu-item>One</emb-menu-item><emb-menu-item>Two</emb-menu-item><emb-menu-item>Three</emb-menu-item>';
    document.body.append(element);
    await element.updateComplete;

    const items = Array.from(element.children) as HTMLElement[];
    const firstButton = items[0]?.shadowRoot?.querySelector("button") as HTMLButtonElement;
    const secondButton = items[1]?.shadowRoot?.querySelector("button") as HTMLButtonElement;

    firstButton.focus();
    firstButton.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, composed: true }));
    await Promise.resolve();

    expect(items[1]?.shadowRoot?.activeElement).toBe(secondButton);
    expect(element.getAttribute("role")).toBe("menu");
  });
});
