import "../../register.js";

import { EmbStack } from "./emb-stack.js";

describe("emb-stack", () => {
  it("maps gap and alignment properties to the internal stack styles", async () => {
    const element = document.createElement("emb-stack") as EmbStack;
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
