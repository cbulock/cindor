import "../../register.js";

import { EmbSkeleton } from "./emb-skeleton.js";

describe("emb-skeleton", () => {
  it("reflects the selected variant", async () => {
    const element = document.createElement("emb-skeleton") as EmbSkeleton;
    element.variant = "circle";
    document.body.append(element);
    await element.updateComplete;

    expect(element.getAttribute("variant")).toBe("circle");
    expect(element.renderRoot.querySelector('[part="surface"]')).not.toBeNull();
  });
});
