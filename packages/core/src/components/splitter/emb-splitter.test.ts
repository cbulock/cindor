import "../../register.js";

import { EmbSplitterPanel } from "../splitter-panel/emb-splitter-panel.js";
import { EmbSplitter } from "./emb-splitter.js";

describe("emb-splitter", () => {
  it("distributes panel sizes when no explicit sizes are provided", async () => {
    const element = document.createElement("emb-splitter") as EmbSplitter;
    element.innerHTML = `
      <emb-splitter-panel><p>Navigation</p></emb-splitter-panel>
      <emb-splitter-panel><p>Content</p></emb-splitter-panel>
    `;
    document.body.append(element);
    await element.updateComplete;

    const panels = element.querySelectorAll("emb-splitter-panel");
    expect((panels[0] as HTMLElement).style.flex).toContain("50%");
    expect((panels[1] as HTMLElement).style.flex).toContain("50%");
  });

  it("resizes adjacent panels with keyboard interaction", async () => {
    const element = document.createElement("emb-splitter") as EmbSplitter;
    element.innerHTML = `
      <emb-splitter-panel size="40"></emb-splitter-panel>
      <emb-splitter-panel size="60"></emb-splitter-panel>
    `;
    document.body.append(element);
    await element.updateComplete;

    const handle = element.renderRoot.querySelector('[part="handle"]') as HTMLButtonElement;
    handle.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "ArrowRight" }));
    await element.updateComplete;

    const panels = element.querySelectorAll("emb-splitter-panel");
    expect((panels[0] as EmbSplitterPanel).size).toBeGreaterThan(40);
  });
});
