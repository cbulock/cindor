import "../../register.js";

import { CindorChip } from "./cindor-chip.js";

describe("cindor-chip", () => {
  it("renders slotted content", async () => {
    const element = document.createElement("cindor-chip") as CindorChip;
    element.textContent = "Selected";
    document.body.append(element);
    await element.updateComplete;

    expect(element.textContent).toContain("Selected");
  });
});
