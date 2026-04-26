import "../../register.js";

import { EmbEmptyState } from "./emb-empty-state.js";

describe("emb-empty-state", () => {
  it("renders content and action regions", async () => {
    const element = document.createElement("emb-empty-state") as EmbEmptyState;
    element.innerHTML = '<p>No items yet</p><emb-button slot="actions">Create item</emb-button>';
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="content"]')).not.toBeNull();
    expect(element.renderRoot.querySelector('[part="actions"]')).not.toBeNull();
  });
});
