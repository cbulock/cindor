import "../../register.js";

import { CindorBreadcrumbs } from "./cindor-breadcrumbs.js";

describe("cindor-breadcrumbs", () => {
  it("renders navigation landmarks", async () => {
    const element = document.createElement("cindor-breadcrumbs") as CindorBreadcrumbs;
    element.innerHTML = "<li>Home</li><li>Components</li>";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('nav[aria-label="Breadcrumb"]')).not.toBeNull();
    expect(element.renderRoot.querySelector("ol")).not.toBeNull();
  });
});
