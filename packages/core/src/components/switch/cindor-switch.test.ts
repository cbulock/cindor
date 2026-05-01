import "../../register.js";

import { CindorSwitch } from "./cindor-switch.js";

type TestInternals = Pick<ElementInternals, "setFormValue" | "setValidity">;

describe("cindor-switch", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("syncs checked state from the native switch input", async () => {
    const element = document.createElement("cindor-switch") as CindorSwitch;
    const onChange = vi.fn();
    element.addEventListener("change", onChange);
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");
    expect(input).not.toBeNull();

    input!.checked = true;
    input!.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.checked).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("forwards switch semantics and host accessibility to the native control", async () => {
    const element = document.createElement("cindor-switch") as CindorSwitch;
    element.name = "notifications";
    element.required = true;
    element.value = "enabled";
    element.setAttribute("aria-label", "Enable notifications");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(input.type).toBe("checkbox");
    expect(input.getAttribute("role")).toBe("switch");
    expect(input.name).toBe("notifications");
    expect(input.required).toBe(true);
    expect(input.value).toBe("enabled");
    expect(input.getAttribute("aria-label")).toBe("Enable notifications");
  });

  it("delegates focus and validity and resets to its default checked state", async () => {
    const element = document.createElement("cindor-switch") as CindorSwitch;
    const internals = {
      setFormValue: vi.fn(),
      setValidity: vi.fn()
    } satisfies TestInternals;
    (element as unknown as { internals?: TestInternals }).internals = internals;
    element.setAttribute("checked", "");
    element.checked = true;
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    input.checkValidity = vi.fn(() => false);
    input.reportValidity = vi.fn(() => false);
    input.focus = vi.fn();

    expect(element.checkValidity()).toBe(false);
    expect(element.reportValidity()).toBe(false);
    element.focus();
    expect(input.focus).toHaveBeenCalledTimes(1);

    input.checked = false;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await element.updateComplete;

    expect(internals.setFormValue).toHaveBeenLastCalledWith(null);

    element.formResetCallback();
    await element.updateComplete;

    expect(element.checked).toBe(true);
    expect(input.checked).toBe(true);
  });
});
