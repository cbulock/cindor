import "../../register.js";

import { CindorProgress } from "./cindor-progress.js";

describe("cindor-progress", () => {
  it("syncs host values to the native progress element", async () => {
    const element = document.createElement("cindor-progress") as CindorProgress;
    element.value = 48;
    element.max = 60;
    document.body.append(element);
    await element.updateComplete;

    const progress = element.renderRoot.querySelector("progress");

    expect(progress?.value).toBe(48);
    expect(progress?.max).toBe(60);
  });
});
