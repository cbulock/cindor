import "../../register.js";

import { EmbActivityFeed } from "./emb-activity-feed.js";

describe("emb-activity-feed", () => {
  it("exposes list semantics", async () => {
    const element = document.createElement("emb-activity-feed") as EmbActivityFeed;
    document.body.append(element);
    await element.updateComplete;

    expect(element.getAttribute("role")).toBe("list");
    expect(element.renderRoot.querySelector('[part="feed"]')).not.toBeNull();
  });
});
