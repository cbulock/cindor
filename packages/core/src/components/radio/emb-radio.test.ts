import "../../register.js";

import { EmbRadio } from "./emb-radio.js";

type TestInternals = Pick<ElementInternals, "setFormValue" | "setValidity">;

describe("emb-radio", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("syncs checked state from the native radio input", async () => {
    const element = document.createElement("emb-radio") as EmbRadio;
    const onInput = vi.fn();
    element.addEventListener("input", onInput);
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");
    expect(input).not.toBeNull();

    input!.checked = true;
    input!.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.checked).toBe(true);
    input!.dispatchEvent(new Event("input", { bubbles: true }));
    expect(onInput).toHaveBeenCalledTimes(1);
  });

  it("forwards props and aria metadata to the native radio input", async () => {
    const element = document.createElement("emb-radio") as EmbRadio;
    element.name = "framework";
    element.required = true;
    element.value = "react";
    element.setAttribute("aria-label", "React");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(input.type).toBe("radio");
    expect(input.name).toBe("framework");
    expect(input.required).toBe(true);
    expect(input.value).toBe("react");
    expect(input.getAttribute("aria-label")).toBe("React");
  });

  it("delegates focus and validity and resets to its default checked state", async () => {
    const element = document.createElement("emb-radio") as EmbRadio;
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
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(internals.setFormValue).toHaveBeenLastCalledWith(null);

    element.formResetCallback();
    await element.updateComplete;

    expect(element.checked).toBe(true);
    expect(input.checked).toBe(true);
  });
});
