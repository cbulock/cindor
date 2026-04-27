import "../../register.js";

import { EmbChip } from "./emb-chip.js";

describe("emb-chip", () => {
  it("renders slotted content", async () => {
    const element = document.createElement("emb-chip") as EmbChip;
    element.textContent = "Selected";
    document.body.append(element);
    await element.updateComplete;

    expect(element.textContent).toContain("Selected");
  });
});
