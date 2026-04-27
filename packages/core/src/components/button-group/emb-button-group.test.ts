import "../../register.js";

import { EmbButtonGroup } from "./emb-button-group.js";

describe("emb-button-group", () => {
  it("forwards accessible naming to the internal group", async () => {
    const element = document.createElement("emb-button-group") as EmbButtonGroup;
    element.setAttribute("aria-label", "Dialog actions");
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="group"]')?.getAttribute("aria-label")).toBe("Dialog actions");
  });

  it("applies attached button radius variables to grouped buttons", async () => {
    const element = document.createElement("emb-button-group") as EmbButtonGroup;
    element.attached = true;
    element.innerHTML = `
      <emb-button>Back</emb-button>
      <emb-button>Next</emb-button>
    `;
    document.body.append(element);
    await element.updateComplete;

    const [firstButton, secondButton] = Array.from(element.children) as HTMLElement[];

    expect(firstButton.style.getPropertyValue("--emb-button-border-start-start-radius")).toBe("var(--radius-md)");
    expect(firstButton.style.getPropertyValue("--emb-button-border-start-end-radius")).toBe("0px");
    expect(secondButton.style.marginInlineStart).toBe("-1px");
    expect(secondButton.style.getPropertyValue("--emb-button-border-end-end-radius")).toBe("var(--radius-md)");
  });
});
