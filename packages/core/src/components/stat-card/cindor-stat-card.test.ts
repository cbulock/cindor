import "../../register.js";

import { CindorStatCard } from "./cindor-stat-card.js";

describe("cindor-stat-card", () => {
  it("renders label and value content", async () => {
    const element = document.createElement("cindor-stat-card") as CindorStatCard;
    element.label = "Active users";
    element.value = "2,481";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="label"]')?.textContent).toContain("Active users");
    expect(element.renderRoot.querySelector('[part="value"]')?.textContent).toContain("2,481");
  });
});
