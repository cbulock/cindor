import "../../register.js";

import { EmbBadge } from "./emb-badge.js";

describe("emb-badge", () => {
  it("reflects the selected tone", async () => {
    const element = document.createElement("emb-badge") as EmbBadge;
    element.tone = "accent";
    document.body.append(element);
    await element.updateComplete;

    expect(element.getAttribute("tone")).toBe("accent");
  });
});
