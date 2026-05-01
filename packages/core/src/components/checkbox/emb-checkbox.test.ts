import "../../register.js";

import { EmbCheckbox } from "./emb-checkbox.js";

type TestInternals = Pick<ElementInternals, "setFormValue" | "setValidity">;

describe("emb-checkbox", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("syncs checked state from the native checkbox", async () => {
    const element = document.createElement("emb-checkbox") as EmbCheckbox;
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

  it("forwards core props and aria metadata to the native checkbox", async () => {
    const element = document.createElement("emb-checkbox") as EmbCheckbox;
    element.name = "terms";
    element.required = true;
    element.value = "accepted";
    element.setAttribute("aria-label", "Accept terms");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(input.type).toBe("checkbox");
    expect(input.name).toBe("terms");
    expect(input.required).toBe(true);
    expect(input.value).toBe("accepted");
    expect(input.getAttribute("aria-label")).toBe("Accept terms");
  });

  it("delegates focus and validity and resets to its default checked state", async () => {
    const element = document.createElement("emb-checkbox") as EmbCheckbox;
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

    expect(element.checked).toBe(false);
    expect(internals.setFormValue).toHaveBeenLastCalledWith(null);

    element.formDisabledCallback(true);
    await element.updateComplete;
    expect(input.disabled).toBe(true);

    element.formDisabledCallback(false);
    element.formResetCallback();
    await element.updateComplete;

    expect(element.checked).toBe(true);
    expect(input.checked).toBe(true);
  });
});
