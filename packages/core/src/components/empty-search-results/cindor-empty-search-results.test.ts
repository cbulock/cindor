import "../../register.js";

import { CindorEmptySearchResults } from "./cindor-empty-search-results.js";

describe("cindor-empty-search-results", () => {
  it("renders a query-aware fallback message", async () => {
    const element = document.createElement("cindor-empty-search-results") as CindorEmptySearchResults;
    element.query = "audit logs";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="heading"]')?.textContent).toContain("No matching results");
    expect(element.renderRoot.querySelector('[part="description"]')?.textContent).toContain("audit logs");
  });
});
