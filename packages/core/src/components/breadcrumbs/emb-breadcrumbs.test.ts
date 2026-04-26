import "../../register.js";

import { EmbBreadcrumbs } from "./emb-breadcrumbs.js";

describe("emb-breadcrumbs", () => {
  it("renders navigation landmarks", async () => {
    const element = document.createElement("emb-breadcrumbs") as EmbBreadcrumbs;
    element.innerHTML = "<li>Home</li><li>Components</li>";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('nav[aria-label="Breadcrumb"]')).not.toBeNull();
    expect(element.renderRoot.querySelector("ol")).not.toBeNull();
  });
});
