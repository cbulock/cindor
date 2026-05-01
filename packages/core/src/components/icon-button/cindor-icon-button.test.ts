import "../../register.js";

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
});
