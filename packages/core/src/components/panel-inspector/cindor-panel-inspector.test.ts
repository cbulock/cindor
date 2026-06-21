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

  it("supports a configurable heading level", async () => {
    const element = document.createElement("cindor-panel-inspector") as CindorPanelInspector;
    element.title = "Inspector title";
    element.headingLevel = 3;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("h3.title")?.textContent).toContain("Inspector title");
    expect(element.renderRoot.querySelector("h2.title")).toBeNull();
  });

  it("omits empty optional wrappers when their slots are unused", async () => {
    const element = document.createElement("cindor-panel-inspector") as CindorPanelInspector;
    element.title = "Deployment details";
    element.innerHTML = `<p>Build 2026.04.28-1</p>`;
    document.body.append(element);
    await element.updateComplete;
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="meta"]')).toBeNull();
    expect(element.renderRoot.querySelector('[part="actions"]')).toBeNull();
    expect(element.renderRoot.querySelector('[part="footer"]')).toBeNull();
    expect(element.renderRoot.querySelector('[part="body"]')).not.toBeNull();
    expect(element.textContent).toContain("Build 2026.04.28-1");
  });
});
