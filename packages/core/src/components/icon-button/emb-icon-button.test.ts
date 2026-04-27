import "../../register.js";

import { EmbIconButton } from "./emb-icon-button.js";

describe("emb-icon-button", () => {
  it("renders an icon-only button with an accessible label", async () => {
    const element = document.createElement("emb-icon-button") as EmbIconButton;
    element.label = "Dismiss";
    element.name = "x";
    document.body.append(element);
    await element.updateComplete;

    const button = element.renderRoot.querySelector("emb-button");
    const icon = element.renderRoot.querySelector("emb-icon");

    expect(button?.getAttribute("aria-label")).toBe("Dismiss");
    expect(icon?.getAttribute("name")).toBe("x");
  });
});
