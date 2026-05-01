import "../../register.js";

import { CindorSpinner } from "./cindor-spinner.js";

describe("cindor-spinner", () => {
  it("renders a spinner indicator", async () => {
    const element = document.createElement("cindor-spinner") as CindorSpinner;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("span")).not.toBeNull();
  });
});
