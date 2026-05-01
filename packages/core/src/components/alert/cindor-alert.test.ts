import "../../register.js";

import { CindorAlert } from "./cindor-alert.js";

describe("cindor-alert", () => {
  it("renders an alert region", async () => {
    const element = document.createElement("cindor-alert") as CindorAlert;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[role="alert"]')).not.toBeNull();
  });
});
