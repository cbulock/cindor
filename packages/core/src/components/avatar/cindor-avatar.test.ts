import "../../register.js";

import { CindorAvatar } from "./cindor-avatar.js";

describe("cindor-avatar", () => {
  it("renders fallback initials from the provided name", async () => {
    const element = document.createElement("cindor-avatar") as CindorAvatar;
    element.name = "Cindor Line";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="fallback"]')?.textContent?.trim()).toBe("CL");
  });

  it.each(["load", "error"])("exposes the image's non-bubbling %s event on the host", async (type) => {
    const element = document.createElement("cindor-avatar") as CindorAvatar;
    element.src = "/avatar.png";
    const parent = document.createElement("div");
    parent.append(element);
    document.body.append(parent);
    await element.updateComplete;

    const listener = vi.fn();
    const ancestor = vi.fn();
    element.addEventListener(type, listener);
    parent.addEventListener(type, ancestor);
    element.renderRoot.querySelector("img")!.dispatchEvent(new Event(type));

    expect(listener).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ target: element, bubbles: false }));
    expect(ancestor).not.toHaveBeenCalled();
  });
});
