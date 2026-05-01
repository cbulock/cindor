import "../../register.js";

import { CindorSkeleton } from "./cindor-skeleton.js";

describe("cindor-skeleton", () => {
  it("reflects the selected variant", async () => {
    const element = document.createElement("cindor-skeleton") as CindorSkeleton;
    element.variant = "circle";
    document.body.append(element);
    await element.updateComplete;

    expect(element.getAttribute("variant")).toBe("circle");
    expect(element.renderRoot.querySelector('[part="surface"]')).not.toBeNull();
  });
});
