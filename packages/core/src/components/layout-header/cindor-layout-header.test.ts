import "../../register.js";

import { CindorLayoutHeader } from "./cindor-layout-header.js";

describe("cindor-layout-header", () => {
  it("renders content inside a header landmark", async () => {
    const element = document.createElement("cindor-layout-header") as CindorLayoutHeader;
    element.innerHTML = "<h1>Overview</h1>";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("header")).not.toBeNull();
    expect(element.textContent).toContain("Overview");
  });
});
