import "../../register.js";

import { clearToasts, dismissToast, ensureToastRegion, showToast } from "./toast-manager.js";
import { EmbToastRegion } from "./emb-toast-region.js";

describe("toast-manager", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("creates and reuses the default toast region", () => {
    const firstRegion = ensureToastRegion();
    const secondRegion = ensureToastRegion();

    expect(firstRegion).toBe(secondRegion);
    expect(firstRegion.id).toBe("emberline-toast-region");
    expect(document.body.contains(firstRegion)).toBe(true);
  });

  it("shows and dismisses toasts through the default region helpers", async () => {
    const id = showToast({
      content: "Saved changes",
      duration: 0,
      tone: "success"
    });

    const region = ensureToastRegion();
    await region.updateComplete;

    expect(region.querySelector(`[data-toast-id="${id}"]`)?.textContent).toContain("Saved changes");
    expect(dismissToast(id)).toBe(true);
    expect(region.querySelector(`[data-toast-id="${id}"]`)).toBeNull();
  });

  it("clears all toasts from a provided region", async () => {
    const region = document.createElement("emb-toast-region") as EmbToastRegion;
    document.body.append(region);
    await region.updateComplete;

    showToast({ content: "First", duration: 0 }, region);
    showToast({ content: "Second", duration: 0 }, region);

    clearToasts(region);

    expect(region.querySelectorAll("emb-toast")).toHaveLength(0);
  });
});
