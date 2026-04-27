import "../../register.js";

import { EmbToolbar } from "./emb-toolbar.js";

describe("emb-toolbar", () => {
  it("forwards accessible naming to the internal toolbar", async () => {
    const element = document.createElement("emb-toolbar") as EmbToolbar;
    element.setAttribute("aria-label", "Editor actions");
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="toolbar"]')?.getAttribute("aria-label")).toBe("Editor actions");
  });

  it("moves focus between controls with arrow keys", async () => {
    const element = document.createElement("emb-toolbar") as EmbToolbar;
    element.innerHTML = `
      <emb-button>Bold</emb-button>
      <emb-button>Italic</emb-button>
      <emb-icon-button label="More actions" name="ellipsis"></emb-icon-button>
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
