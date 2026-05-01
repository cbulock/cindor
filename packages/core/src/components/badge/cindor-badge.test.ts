import "../../register.js";

import { CindorBadge } from "./cindor-badge.js";

describe("cindor-badge", () => {
  it("reflects the selected tone", async () => {
    const element = document.createElement("cindor-badge") as CindorBadge;
    element.tone = "accent";
    document.body.append(element);
    await element.updateComplete;

    expect(element.getAttribute("tone")).toBe("accent");
  });
});
