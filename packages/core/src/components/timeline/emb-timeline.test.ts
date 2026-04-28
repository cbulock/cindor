import "../../register.js";

import { EmbTimeline } from "./emb-timeline.js";

describe("emb-timeline", () => {
  it("renders an ordered list", async () => {
    const element = document.createElement("emb-timeline") as EmbTimeline;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("ol")).not.toBeNull();
  });
});
