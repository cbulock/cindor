import "../../register.js";

import { CindorStack } from "./cindor-stack.js";

describe("cindor-stack", () => {
  it("maps gap and alignment properties to the internal stack styles", async () => {
    const element = document.createElement("cindor-stack") as CindorStack;
    element.direction = "horizontal";
    element.gap = "4";
    element.align = "center";
    element.justify = "between";
    element.wrap = true;
    document.body.append(element);
    await element.updateComplete;

    const stack = element.renderRoot.querySelector('[part="stack"]');
    const style = stack?.getAttribute("style") ?? "";

    expect(style).toContain("var(--space-4)");
    expect(style).toContain("align-items: center");
    expect(style).toContain("justify-content: space-between");
    expect(element.hasAttribute("wrap")).toBe(true);
  });
});
