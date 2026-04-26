import "../../register.js";

import { EmbToastRegion } from "./emb-toast-region.js";

describe("emb-toast-region", () => {
  it("creates managed toasts imperatively", async () => {
    const region = document.createElement("emb-toast-region") as EmbToastRegion;
    document.body.append(region);
    await region.updateComplete;

    const id = region.showToast({
      content: "Saved changes",
      duration: 0,
      tone: "success"
    });

    const toast = region.querySelector(`[data-toast-id="${id}"]`);

    expect(toast).not.toBeNull();
    expect(toast?.getAttribute("tone")).toBe("success");
    expect(toast?.textContent).toContain("Saved changes");
  });

  it("enforces the visible toast limit", async () => {
    const region = document.createElement("emb-toast-region") as EmbToastRegion;
    region.maxVisible = 1;
    document.body.append(region);
    await region.updateComplete;

    region.showToast({ content: "First", duration: 0 });
    const secondId = region.showToast({ content: "Second", duration: 0 });

    expect(region.querySelectorAll("emb-toast")).toHaveLength(1);
    expect(region.querySelector(`[data-toast-id="${secondId}"]`)?.textContent).toContain("Second");
  });
});
