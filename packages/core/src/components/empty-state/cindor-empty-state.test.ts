import "../../register.js";

import { CindorEmptyState } from "./cindor-empty-state.js";

describe("cindor-empty-state", () => {
  it("renders content and action regions", async () => {
    const element = document.createElement("cindor-empty-state") as CindorEmptyState;
    element.innerHTML = '<p>No items yet</p><cindor-button slot="actions">Create item</cindor-button>';
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="content"]')).not.toBeNull();
    expect(element.renderRoot.querySelector('[part="actions"]')).not.toBeNull();
  });
});
