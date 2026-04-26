import "../../register.js";

import { EmbProgress } from "./emb-progress.js";

describe("emb-progress", () => {
  it("syncs host values to the native progress element", async () => {
    const element = document.createElement("emb-progress") as EmbProgress;
    element.value = 48;
    element.max = 60;
    document.body.append(element);
    await element.updateComplete;

    const progress = element.renderRoot.querySelector("progress");

    expect(progress?.value).toBe(48);
    expect(progress?.max).toBe(60);
  });
});
