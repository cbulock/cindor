import "../../register.js";

import { CindorPanelInspector } from "./cindor-panel-inspector.js";

describe("cindor-panel-inspector", () => {
  it("renders heading copy and footer content", async () => {
    const element = document.createElement("cindor-panel-inspector") as CindorPanelInspector;
    element.title = "Deployment details";
    element.description = "Review the current release metadata and rollout status.";
    element.innerHTML = `
      <div slot="meta">Updated 4 minutes ago</div>
      <div slot="footer">All changes are saved automatically.</div>
      <p>Build 2026.04.28-1</p>
    `;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="title"]')?.textContent).toContain("Deployment details");
    expect(element.renderRoot.querySelector('[part="description"]')?.textContent).toContain("rollout status");
    expect(element.querySelector('[slot="footer"]')?.textContent).toContain("saved automatically");
  });
});
