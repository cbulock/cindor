import "../../register.js";

import { EmbPasswordInput } from "./emb-password-input.js";

describe("emb-password-input", () => {
  it("renders a native password input", async () => {
    const element = document.createElement("emb-password-input") as EmbPasswordInput;
    element.value = "hunter2";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.getAttribute("type")).toBe("password");
    expect(input?.value).toBe("hunter2");
  });

  it("toggles password visibility from the inline eye control", async () => {
    const element = document.createElement("emb-password-input") as EmbPasswordInput;
    element.value = "hunter2";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");
    const toggle = element.renderRoot.querySelector('[part="toggle"]') as HTMLButtonElement;

    expect(toggle.getAttribute("aria-label")).toBe("Show password");
    toggle.click();
    await element.updateComplete;

    expect(input?.getAttribute("type")).toBe("text");
    expect(toggle.getAttribute("aria-label")).toBe("Hide password");
    expect(element.renderRoot.querySelector('[part="toggle-icon"]')).not.toBeNull();
  });
});
