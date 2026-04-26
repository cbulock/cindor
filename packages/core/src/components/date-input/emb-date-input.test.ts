import "../../register.js";

import { EmbDateInput } from "./emb-date-input.js";

describe("emb-date-input", () => {
  it("renders a native date input", async () => {
    const element = document.createElement("emb-date-input") as EmbDateInput;
    element.value = "2026-04-26";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.value).toBe("2026-04-26");
    expect(input?.getAttribute("type")).toBe("date");
  });
});
