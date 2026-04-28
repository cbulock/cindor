import "../../register.js";

import { EmbEmptySearchResults } from "./emb-empty-search-results.js";

describe("emb-empty-search-results", () => {
  it("renders a query-aware fallback message", async () => {
    const element = document.createElement("emb-empty-search-results") as EmbEmptySearchResults;
    element.query = "audit logs";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="heading"]')?.textContent).toContain("No matching results");
    expect(element.renderRoot.querySelector('[part="description"]')?.textContent).toContain("audit logs");
  });
});
