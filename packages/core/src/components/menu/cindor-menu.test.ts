import "../../register.js";

import { CindorMenu } from "./cindor-menu.js";

describe("cindor-menu", () => {
  it("supports arrow-key focus movement across menu items", async () => {
    const element = document.createElement("cindor-menu") as CindorMenu;
    element.innerHTML = '<cindor-menu-item>One</cindor-menu-item><cindor-menu-item>Two</cindor-menu-item><cindor-menu-item>Three</cindor-menu-item>';
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
