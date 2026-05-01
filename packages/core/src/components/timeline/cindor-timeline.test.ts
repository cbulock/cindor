import "../../register.js";

import { CindorTimeline } from "./cindor-timeline.js";

describe("cindor-timeline", () => {
  it("renders an ordered list", async () => {
    const element = document.createElement("cindor-timeline") as CindorTimeline;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("ol")).not.toBeNull();
  });
});
