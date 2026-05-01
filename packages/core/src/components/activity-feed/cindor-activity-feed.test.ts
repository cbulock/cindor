import "../../register.js";

import { CindorActivityFeed } from "./cindor-activity-feed.js";

describe("cindor-activity-feed", () => {
  it("exposes list semantics", async () => {
    const element = document.createElement("cindor-activity-feed") as CindorActivityFeed;
    document.body.append(element);
    await element.updateComplete;

    expect(element.getAttribute("role")).toBe("list");
    expect(element.renderRoot.querySelector('[part="feed"]')).not.toBeNull();
  });
});
