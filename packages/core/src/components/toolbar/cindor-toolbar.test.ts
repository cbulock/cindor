import "../../register.js";

import { CindorToolbar } from "./cindor-toolbar.js";

describe("cindor-toolbar", () => {
  it("forwards accessible naming to the internal toolbar", async () => {
    const element = document.createElement("cindor-toolbar") as CindorToolbar;
    element.setAttribute("aria-label", "Editor actions");
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="toolbar"]')?.getAttribute("aria-label")).toBe("Editor actions");
  });

  it("moves focus between controls with arrow keys", async () => {
    const element = document.createElement("cindor-toolbar") as CindorToolbar;
    element.innerHTML = `
      <cindor-button>Bold</cindor-button>
      <cindor-button>Italic</cindor-button>
      <cindor-icon-button label="More actions" name="ellipsis"></cindor-icon-button>
    `;
    document.body.append(element);
    await element.updateComplete;

    const [firstButton, secondButton] = Array.from(element.children) as HTMLElement[];
    firstButton.focus();

    const firstControl = firstButton.shadowRoot?.querySelector("button") as HTMLButtonElement;
    firstControl.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "ArrowRight" }));
    await element.updateComplete;

    expect(secondButton.shadowRoot?.activeElement?.tagName).toBe("BUTTON");
  });
});
