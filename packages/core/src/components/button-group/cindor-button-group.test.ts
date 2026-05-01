import "../../register.js";

import { CindorButtonGroup } from "./cindor-button-group.js";

describe("cindor-button-group", () => {
  it("forwards accessible naming to the internal group", async () => {
    const element = document.createElement("cindor-button-group") as CindorButtonGroup;
    element.setAttribute("aria-label", "Dialog actions");
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="group"]')?.getAttribute("aria-label")).toBe("Dialog actions");
  });

  it("applies attached button radius variables to grouped buttons", async () => {
    const element = document.createElement("cindor-button-group") as CindorButtonGroup;
    element.attached = true;
    element.innerHTML = `
      <cindor-button>Back</cindor-button>
      <cindor-button>Next</cindor-button>
    `;
    document.body.append(element);
    await element.updateComplete;

    const [firstButton, secondButton] = Array.from(element.children) as HTMLElement[];

    expect(firstButton.style.getPropertyValue("--cindor-button-border-start-start-radius")).toBe("var(--radius-md)");
    expect(firstButton.style.getPropertyValue("--cindor-button-border-start-end-radius")).toBe("0px");
    expect(secondButton.style.marginInlineStart).toBe("-1px");
    expect(secondButton.style.getPropertyValue("--cindor-button-border-end-end-radius")).toBe("var(--radius-md)");
  });
});
