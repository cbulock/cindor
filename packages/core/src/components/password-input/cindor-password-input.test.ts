import "../../register.js";

import { CindorPasswordInput } from "./cindor-password-input.js";

describe("cindor-password-input", () => {
  it("forwards accessible naming attributes to the internal input", async () => {
    const element = document.createElement("cindor-password-input") as CindorPasswordInput;
    element.setAttribute("aria-label", "Account password");
    element.setAttribute("aria-describedby", "password-help");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.getAttribute("aria-label")).toBe("Account password");
    expect(input?.getAttribute("aria-describedby")).toBe("password-help");
  });

  it("renders a native password input", async () => {
    const element = document.createElement("cindor-password-input") as CindorPasswordInput;
    element.value = "hunter2";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.getAttribute("type")).toBe("password");
    expect(input?.value).toBe("hunter2");
  });

  it("toggles password visibility from the inline eye control", async () => {
    const element = document.createElement("cindor-password-input") as CindorPasswordInput;
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

  it("does not reveal the password when disabled", async () => {
    const element = document.createElement("cindor-password-input") as CindorPasswordInput;
    element.disabled = true;
    element.value = "hunter2";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");
    const toggle = element.renderRoot.querySelector('[part="toggle"]') as HTMLButtonElement;

    toggle.click();
    await element.updateComplete;

    expect(input?.getAttribute("type")).toBe("password");
    expect(toggle.getAttribute("aria-label")).toBe("Show password");
  });

  it("updates the host value from native input events", async () => {
    const element = document.createElement("cindor-password-input") as CindorPasswordInput;
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    input.value = "new-secret";
    input.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.value).toBe("new-secret");
    expect(input.value).toBe("new-secret");
  });
});
