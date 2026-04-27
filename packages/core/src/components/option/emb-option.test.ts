import "../../register.js";

import { EmbOption } from "./emb-option.js";

describe("emb-option", () => {
  it("emits select and hover events when interactive", async () => {
    const element = document.createElement("emb-option") as EmbOption;
    element.value = "alpha";
    element.textContent = "Alpha";
    document.body.append(element);
    await element.updateComplete;

    const selected = vi.fn();
    const hovered = vi.fn();
    element.addEventListener("option-select", selected);
    element.addEventListener("option-hover", hovered);

    const surface = element.renderRoot.querySelector('[part="surface"]') as HTMLElement;
    surface.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, composed: true }));
    surface.click();

    expect(hovered).toHaveBeenCalledTimes(1);
    expect(selected).toHaveBeenCalledTimes(1);
    expect(element.getAttribute("role")).toBe("option");
  });
});
