import "../../register.js";

import { CindorAvatar } from "./cindor-avatar.js";

describe("cindor-avatar", () => {
  it("renders fallback initials from the provided name", async () => {
    const element = document.createElement("cindor-avatar") as CindorAvatar;
    element.name = "Cindor Line";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="fallback"]')?.textContent?.trim()).toBe("CL");
  });
});
