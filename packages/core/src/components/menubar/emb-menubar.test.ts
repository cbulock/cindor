import "../../register.js";

import { EmbMenubar } from "./emb-menubar.js";

describe("emb-menubar", () => {
  it("applies menubar semantics", async () => {
    const element = document.createElement("emb-menubar") as EmbMenubar;
    element.setAttribute("aria-label", "Application");
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[role="menubar"]')?.getAttribute("aria-label")).toBe("Application");
  });

  it("moves focus with arrow keys", async () => {
    const element = document.createElement("emb-menubar") as EmbMenubar;
    element.innerHTML = "<emb-button>File</emb-button><emb-button>Edit</emb-button>";
    document.body.append(element);
    await element.updateComplete;

    const [first, second] = Array.from(element.children) as HTMLElement[];
    first.focus();
    (first.shadowRoot?.querySelector("button") as HTMLButtonElement).dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "ArrowRight" })
    );
    await element.updateComplete;

    expect(second.shadowRoot?.activeElement?.tagName).toBe("BUTTON");
  });
});
