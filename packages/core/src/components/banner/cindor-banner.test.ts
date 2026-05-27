import "../../register.js";

import { CindorBanner } from "./cindor-banner.js";

describe("cindor-banner", () => {
  it("uses a polite status region by default", async () => {
    const element = document.createElement("cindor-banner") as CindorBanner;
    element.textContent = "Changes saved.";
    document.body.append(element);
    await element.updateComplete;

    const surface = element.renderRoot.querySelector('[part="surface"]');
    expect(surface?.getAttribute("role")).toBe("status");
    expect(surface?.getAttribute("aria-live")).toBe("polite");
  });

  it("derives alert semantics for warning tone", async () => {
    const element = document.createElement("cindor-banner") as CindorBanner;
    element.tone = "warning";
    element.textContent = "Deployment paused.";
    document.body.append(element);
    await element.updateComplete;

    const surface = element.renderRoot.querySelector('[part="surface"]');
    expect(surface?.getAttribute("role")).toBe("alert");
    expect(surface?.getAttribute("aria-live")).toBe("assertive");
  });

  it("renders a dismiss button and emits dismiss events when closed", async () => {
    const element = document.createElement("cindor-banner") as CindorBanner;
    element.dismissible = true;
    element.textContent = "Maintenance starts at 8 PM.";
    const dismissSpy = vi.fn();
    const openChangeSpy = vi.fn();
    element.addEventListener("dismiss", dismissSpy);
    element.addEventListener("open-change", openChangeSpy);
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="close-button"]')).not.toBeNull();

    element.close();
    await element.updateComplete;

    expect(element.open).toBe(false);
    expect(dismissSpy).toHaveBeenCalledTimes(1);
    expect(openChangeSpy).toHaveBeenCalledTimes(1);
    expect(openChangeSpy.mock.calls[0]?.[0]?.detail).toEqual({ open: false });
    expect(element.renderRoot.querySelector('[part="surface"]')).toBeNull();
  });
});
