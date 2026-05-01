import "../../register.js";

import { CindorPageHeader } from "./cindor-page-header.js";

describe("cindor-page-header", () => {
  it("renders copy, meta, and action slots", async () => {
    const element = document.createElement("cindor-page-header") as CindorPageHeader;
    element.eyebrow = "Workspace";
    element.title = "Release overview";
    element.description = "Track deployment health, incidents, and pending approvals.";
    element.innerHTML = `
      <cindor-badge slot="meta">Production</cindor-badge>
      <cindor-button slot="actions">Deploy</cindor-button>
    `;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="title"]')?.textContent).toContain("Release overview");
    expect(element.renderRoot.querySelector('[part="description"]')?.textContent).toContain("Track deployment health");
    expect(element.querySelector('[slot="actions"]')?.textContent).toContain("Deploy");
  });
});
