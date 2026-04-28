import "../../register.js";

import { EmbPageHeader } from "./emb-page-header.js";

describe("emb-page-header", () => {
  it("renders copy, meta, and action slots", async () => {
    const element = document.createElement("emb-page-header") as EmbPageHeader;
    element.eyebrow = "Workspace";
    element.title = "Release overview";
    element.description = "Track deployment health, incidents, and pending approvals.";
    element.innerHTML = `
      <emb-badge slot="meta">Production</emb-badge>
      <emb-button slot="actions">Deploy</emb-button>
    `;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="title"]')?.textContent).toContain("Release overview");
    expect(element.renderRoot.querySelector('[part="description"]')?.textContent).toContain("Track deployment health");
    expect(element.querySelector('[slot="actions"]')?.textContent).toContain("Deploy");
  });
});
