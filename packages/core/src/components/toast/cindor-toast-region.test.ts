import "../../register.js";

import { CindorToastRegion } from "./cindor-toast-region.js";

describe("cindor-toast-region", () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("creates managed toasts imperatively", async () => {
    const region = document.createElement("cindor-toast-region") as CindorToastRegion;
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
    const region = document.createElement("cindor-toast-region") as CindorToastRegion;
    region.maxVisible = 1;
    document.body.append(region);
    await region.updateComplete;

    region.showToast({ content: "First", duration: 0 });
    const secondId = region.showToast({ content: "Second", duration: 0 });

    expect(region.querySelectorAll("cindor-toast")).toHaveLength(1);
    expect(region.querySelector(`[data-toast-id="${secondId}"]`)?.textContent).toContain("Second");
  });

  it("supports custom ids, node content, and non-dismissible toasts", async () => {
    const region = document.createElement("cindor-toast-region") as CindorToastRegion;
    document.body.append(region);
    await region.updateComplete;

    const content = document.createElement("strong");
    content.textContent = "Saved";

    const id = region.showToast({
      content,
      dismissible: false,
      duration: 0,
      id: "toast-custom"
    });

    const toast = region.querySelector('[data-toast-id="toast-custom"]');

    expect(id).toBe("toast-custom");
    expect(toast?.hasAttribute("dismissible")).toBe(false);
    expect(toast?.querySelector("strong")?.textContent).toBe("Saved");
  });

  it("dispatches lifecycle events and removes timed toasts", async () => {
    vi.useFakeTimers();

    const region = document.createElement("cindor-toast-region") as CindorToastRegion;
    document.body.append(region);
    await region.updateComplete;

    const shown = vi.fn();
    const removed = vi.fn();
    region.addEventListener("toast-show", shown);
    region.addEventListener("toast-remove", removed);

    const id = region.showToast({ content: "Soon gone", duration: 25 });

    expect(shown).toHaveBeenCalledTimes(1);
    expect((shown.mock.calls[0]?.[0] as CustomEvent<{ id: string; tone: string }>).detail).toEqual({
      id,
      tone: "neutral"
    });

    vi.advanceTimersByTime(25);
    await Promise.resolve();

    expect(region.querySelector(`[data-toast-id="${id}"]`)).toBeNull();
    expect(removed).toHaveBeenCalledTimes(1);
    expect((removed.mock.calls[0]?.[0] as CustomEvent<{ id: string }>).detail.id).toBe(id);
  });
});
