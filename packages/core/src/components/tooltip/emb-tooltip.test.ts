import "../../register.js";

import { EmbTooltip } from "./emb-tooltip.js";

describe("emb-tooltip", () => {
  it("opens on mouseenter", async () => {
    const element = document.createElement("emb-tooltip") as EmbTooltip;
    element.text = "Helpful hint";
    element.innerHTML = "<button>Trigger</button>";
    document.body.append(element);
    await element.updateComplete;

    const trigger = element.renderRoot.querySelector(".trigger");
    trigger!.dispatchEvent(new Event("mouseenter"));
    await element.updateComplete;
    await Promise.resolve();

    expect(element.open).toBe(true);
    expect(element.renderRoot.querySelector('[role="tooltip"]')).not.toBeNull();
  });
});
