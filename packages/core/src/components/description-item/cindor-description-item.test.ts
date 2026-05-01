import "../../register.js";

import { CindorDescriptionItem } from "./cindor-description-item.js";

describe("cindor-description-item", () => {
  it("renders term and detail semantics", async () => {
    const element = document.createElement("cindor-description-item") as CindorDescriptionItem;
    element.innerHTML = '<span slot="term">Status</span>Healthy';
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("dt")).not.toBeNull();
    expect(element.renderRoot.querySelector("dd")).not.toBeNull();
    expect(element.textContent).toContain("Status");
    expect(element.textContent).toContain("Healthy");
  });
});
