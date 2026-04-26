import "../../register.js";

import { EmbAvatar } from "./emb-avatar.js";

describe("emb-avatar", () => {
  it("renders fallback initials from the provided name", async () => {
    const element = document.createElement("emb-avatar") as EmbAvatar;
    element.name = "Ember Line";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="fallback"]')?.textContent?.trim()).toBe("EL");
  });
});
