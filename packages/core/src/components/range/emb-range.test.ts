import "../../register.js";

import { EmbRange } from "./emb-range.js";

describe("emb-range", () => {
  it("syncs host value to the native range control", async () => {
    const element = document.createElement("emb-range") as EmbRange;
    element.value = 25;
    element.max = 50;
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.value).toBe("25");
    expect(input?.max).toBe("50");
  });
});
