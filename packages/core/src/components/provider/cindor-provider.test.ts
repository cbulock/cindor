import "../../register.js";

import { CindorProvider } from "./cindor-provider.js";

describe("cindor-provider", () => {
  it("scopes theme and color-scheme on the host element", async () => {
    const element = document.createElement("cindor-provider") as CindorProvider;
    element.theme = "dark";
    element.colorScheme = "dark";
    document.body.append(element);
    await element.updateComplete;

    expect(element.getAttribute("data-theme")).toBe("dark");
    expect(element.style.colorScheme).toBe("dark");
  });

  it("removes presentation overrides when set to inherit", async () => {
    const element = document.createElement("cindor-provider") as CindorProvider;
    element.theme = "dark";
    element.colorScheme = "dark";
    document.body.append(element);
    await element.updateComplete;

    element.theme = "inherit";
    element.colorScheme = "inherit";
    await element.updateComplete;

    expect(element.hasAttribute("data-theme")).toBe(false);
    expect(element.style.colorScheme).toBe("");
  });
});
