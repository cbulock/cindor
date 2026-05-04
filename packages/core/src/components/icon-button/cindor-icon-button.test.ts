import "../../register.js";

import { CindorButton } from "../button/cindor-button.js";
import { CindorIconButton } from "./cindor-icon-button.js";

describe("cindor-icon-button", () => {
  it("renders an icon-only button with an accessible label", async () => {
    const element = document.createElement("cindor-icon-button") as CindorIconButton;
    element.label = "Dismiss";
    element.name = "x";
    document.body.append(element);
    await element.updateComplete;

    const button = element.renderRoot.querySelector("cindor-button");
    const icon = element.renderRoot.querySelector("cindor-icon");

    expect(button?.getAttribute("aria-label")).toBe("Dismiss");
    expect(icon?.getAttribute("name")).toBe("x");
  });

  it("passes host aria references through the inner button safely", async () => {
    document.body.innerHTML = `<span id="icon-help">Closes the panel</span>`;

    const element = document.createElement("cindor-icon-button") as CindorIconButton;
    element.label = "Dismiss";
    element.name = "x";
    element.setAttribute("aria-describedby", "icon-help");
    document.body.append(element);
    await element.updateComplete;

    const control = element.renderRoot.querySelector("cindor-button") as CindorButton;
    await control.updateComplete;

    const nativeButton = control.renderRoot.querySelector("button") as HTMLButtonElement;
    const describedById = nativeButton.getAttribute("aria-describedby");

    expect(describedById).toMatch(/-description$/);
    expect(control.renderRoot.querySelector(`#${describedById ?? ""}`)?.textContent).toBe("Closes the panel");
  });
});
