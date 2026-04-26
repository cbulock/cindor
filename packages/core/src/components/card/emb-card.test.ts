import "../../register.js";

import { EmbCard } from "./emb-card.js";

describe("emb-card", () => {
  it("renders slotted content inside an article surface", async () => {
    const element = document.createElement("emb-card") as EmbCard;
    element.innerHTML = "<p>Card body</p>";
    document.body.append(element);
    await element.updateComplete;

    const article = element.renderRoot.querySelector("article");

    expect(article).not.toBeNull();
    expect(element.textContent?.includes("Card body")).toBe(true);
  });
});
