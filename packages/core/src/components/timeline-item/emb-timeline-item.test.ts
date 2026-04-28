import "../../register.js";

import { EmbTimelineItem } from "./emb-timeline-item.js";

describe("emb-timeline-item", () => {
  it("renders title and timestamp slots", async () => {
    const element = document.createElement("emb-timeline-item") as EmbTimelineItem;
    element.innerHTML = '<span slot="title">Deployed</span><span slot="timestamp">2m ago</span>Release 1.2.0 shipped.';
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="title"]')).not.toBeNull();
    expect(element.renderRoot.querySelector('[part="timestamp"]')).not.toBeNull();
    expect(element.textContent).toContain("Deployed");
    expect(element.textContent).toContain("2m ago");
  });
});
