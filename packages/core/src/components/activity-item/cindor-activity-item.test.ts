import "../../register.js";

import { CindorActivityItem } from "./cindor-activity-item.js";

describe("cindor-activity-item", () => {
  it("renders activity metadata and listitem semantics", async () => {
    const element = document.createElement("cindor-activity-item") as CindorActivityItem;
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
