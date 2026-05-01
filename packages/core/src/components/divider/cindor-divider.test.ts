import "../../register.js";

import { CindorDivider } from "./cindor-divider.js";

describe("cindor-divider", () => {
  it("renders a horizontal rule", async () => {
    const element = document.createElement("cindor-divider") as CindorDivider;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("hr")).not.toBeNull();
  });
});
