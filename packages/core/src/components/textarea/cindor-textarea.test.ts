import "../../register.js";

import { CindorTextarea } from "./cindor-textarea.js";

type TestInternals = Pick<ElementInternals, "setFormValue" | "setValidity">;

describe("cindor-textarea", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("syncs host value from the native textarea element", async () => {
    const element = document.createElement("cindor-textarea") as CindorTextarea;
    const onInput = vi.fn();
    element.addEventListener("input", onInput);
    document.body.append(element);
    await element.updateComplete;

    const textarea = element.renderRoot.querySelector("textarea");
    expect(textarea).not.toBeNull();

    textarea!.value = "notes";
    textarea!.dispatchEvent(new Event("input", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("notes");
    expect(onInput).toHaveBeenCalledTimes(1);
  });

  it("forwards textarea attributes and accessibility metadata", async () => {
    const element = document.createElement("cindor-textarea") as CindorTextarea;
    element.name = "notes";
    element.placeholder = "Add notes";
    element.rows = 6;
    element.readonly = true;
    element.required = true;
    element.setAttribute("aria-label", "Notes");
    document.body.append(element);
    await element.updateComplete;

    const textarea = element.renderRoot.querySelector("textarea") as HTMLTextAreaElement;

    expect(textarea.name).toBe("notes");
    expect(textarea.placeholder).toBe("Add notes");
    expect(textarea.rows).toBe(6);
    expect(textarea.readOnly).toBe(true);
    expect(textarea.required).toBe(true);
    expect(textarea.getAttribute("aria-label")).toBe("Notes");
  });

  it("delegates focus and validity APIs and resets to its initial value", async () => {
    const element = document.createElement("cindor-textarea") as CindorTextarea;
    const internals = {
      setFormValue: vi.fn(),
      setValidity: vi.fn()
    } satisfies TestInternals;
    (element as unknown as { internals?: TestInternals }).internals = internals;
    element.setAttribute("value", "seed");
    element.value = "seed";
    document.body.append(element);
    await element.updateComplete;

    const textarea = element.renderRoot.querySelector("textarea") as HTMLTextAreaElement;
    textarea.checkValidity = vi.fn(() => false);
    textarea.reportValidity = vi.fn(() => false);
    textarea.focus = vi.fn();

    expect(element.checkValidity()).toBe(false);
    expect(element.reportValidity()).toBe(false);
    element.focus();
    expect(textarea.focus).toHaveBeenCalledTimes(1);

    textarea.value = "updated";
    textarea.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("updated");

    element.formDisabledCallback(true);
    await element.updateComplete;
    expect(internals.setFormValue).toHaveBeenLastCalledWith(null);

    element.formDisabledCallback(false);
    await element.updateComplete;
    element.formResetCallback();
    await element.updateComplete;

    expect(element.value).toBe("seed");
    expect(textarea.value).toBe("seed");
  });
});
