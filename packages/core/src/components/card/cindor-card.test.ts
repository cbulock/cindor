import "../../register.js";

import { CindorCard } from "./cindor-card.js";

describe("cindor-card", () => {
  it("renders slotted content inside an article surface", async () => {
    const element = document.createElement("cindor-card") as CindorCard;
    element.innerHTML = "<p>Card body</p>";
    document.body.append(element);
    await element.updateComplete;

    const article = element.renderRoot.querySelector("article");

    expect(article).not.toBeNull();
    expect(element.textContent?.includes("Card body")).toBe(true);
  });
});
