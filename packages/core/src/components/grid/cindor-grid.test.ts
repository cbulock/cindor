import "../../register.js";

import { CindorGrid } from "./cindor-grid.js";

describe("cindor-grid", () => {
  it("maps layout properties to the internal grid styles", async () => {
    const element = document.createElement("cindor-grid") as CindorGrid;
    element.columns = 3;
    element.gap = "5";
    element.align = "center";
    element.justify = "end";
    document.body.append(element);
    await element.updateComplete;

    const grid = element.renderRoot.querySelector('[part="grid"]');
    const style = grid?.getAttribute("style") ?? "";

    expect(style).toContain("var(--space-5)");
    expect(style).toContain("repeat(3, minmax(0, 1fr))");
    expect(style).toContain("align-items: center");
    expect(style).toContain("justify-items: end");
  });

  it("switches to auto-fit columns when minColumnWidth is provided", async () => {
    const element = document.createElement("cindor-grid") as CindorGrid;
    element.minColumnWidth = "16rem";
    document.body.append(element);
    await element.updateComplete;

    const style = element.renderRoot.querySelector('[part="grid"]')?.getAttribute("style") ?? "";

    expect(style).toContain("repeat(auto-fit, minmax(min(16rem, 100%), 1fr))");
  });
});
