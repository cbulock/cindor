import "../../register.js";

import { EmbTag } from "./emb-tag.js";

describe("emb-tag", () => {
  it("defaults to accent tone", async () => {
    const element = document.createElement("emb-tag") as EmbTag;
    element.textContent = "Design system";
    document.body.append(element);
    await element.updateComplete;

    expect(element.tone).toBe("accent");
  });
});
