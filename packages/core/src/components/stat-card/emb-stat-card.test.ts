import "../../register.js";

import { EmbStatCard } from "./emb-stat-card.js";

describe("emb-stat-card", () => {
  it("renders label and value content", async () => {
    const element = document.createElement("emb-stat-card") as EmbStatCard;
    element.label = "Active users";
    element.value = "2,481";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="label"]')?.textContent).toContain("Active users");
    expect(element.renderRoot.querySelector('[part="value"]')?.textContent).toContain("2,481");
  });
});
