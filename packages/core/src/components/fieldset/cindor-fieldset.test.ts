import "../../register.js";

import { CindorFieldset } from "./cindor-fieldset.js";

describe("cindor-fieldset", () => {
  it("renders a native fieldset and legend", async () => {
    const element = document.createElement("cindor-fieldset") as CindorFieldset;
    element.legend = "Preferences";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("fieldset")).not.toBeNull();
    expect(element.renderRoot.querySelector("legend")?.textContent).toContain("Preferences");
  });
});
