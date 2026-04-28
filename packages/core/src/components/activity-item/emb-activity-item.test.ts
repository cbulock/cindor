import "../../register.js";

import { EmbActivityItem } from "./emb-activity-item.js";

describe("emb-activity-item", () => {
  it("renders activity metadata and listitem semantics", async () => {
    const element = document.createElement("emb-activity-item") as EmbActivityItem;
    element.innerHTML =
      '<span slot="title">Deployment finished</span><span slot="timestamp">Now</span><span slot="meta">Production</span>Release 1.2.0 is live.';
    document.body.append(element);
    await element.updateComplete;

    expect(element.getAttribute("role")).toBe("listitem");
    expect(element.textContent).toContain("Deployment finished");
    expect(element.textContent).toContain("Now");
    expect(element.textContent).toContain("Production");
  });
});
