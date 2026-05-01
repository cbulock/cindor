import "../../register.js";

import { CindorDescriptionList } from "./cindor-description-list.js";

describe("cindor-description-list", () => {
  it("renders a description list", async () => {
    const element = document.createElement("cindor-description-list") as CindorDescriptionList;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("dl")).not.toBeNull();
  });
});
