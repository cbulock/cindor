import "../../register.js";

import { EmbInput } from "./emb-input.js";

type TestInternals = Pick<ElementInternals, "setFormValue" | "setValidity">;

describe("emb-input", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("syncs host value from the native input element", async () => {
    const element = document.createElement("emb-input") as EmbInput;
    const onInput = vi.fn();
    element.addEventListener("input", onInput);
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");
    expect(input).not.toBeNull();

    input!.value = "hello";
    input!.dispatchEvent(new Event("input", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("hello");
    expect(onInput).toHaveBeenCalledTimes(1);
  });

  it("forwards host labelling attributes to the internal input", async () => {
    const element = document.createElement("emb-input") as EmbInput;
    element.setAttribute("aria-label", "Project name");
    element.setAttribute("aria-describedby", "project-help");
    element.setAttribute("aria-labelledby", "project-label");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.getAttribute("aria-label")).toBe("Project name");
    expect(input?.getAttribute("aria-describedby")).toBe("project-help");
    expect(input?.getAttribute("aria-labelledby")).toBe("project-label");
  });

  it("renders configured start and end icons", async () => {
    const element = document.createElement("emb-input") as EmbInput;
    element.startIcon = "search";
    element.endIcon = "x";
    document.body.append(element);
    await element.updateComplete;

    const icons = element.renderRoot.querySelectorAll("emb-icon");

    expect(icons).toHaveLength(2);
    expect(icons[0]?.getAttribute("name")).toBe("search");
    expect(icons[1]?.getAttribute("name")).toBe("x");
  });

  it("forwards core input attributes to the native control", async () => {
    const element = document.createElement("emb-input") as EmbInput;
    element.type = "email";
    element.autocomplete = "email";
    element.placeholder = "hello@example.com";
    element.name = "email";
    element.min = "1";
    element.max = "10";
    element.readonly = true;
    element.required = true;
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(input.type).toBe("email");
    expect(input.autocomplete).toBe("email");
    expect(input.placeholder).toBe("hello@example.com");
    expect(input.name).toBe("email");
    expect(input.min).toBe("1");
    expect(input.max).toBe("10");
    expect(input.readOnly).toBe(true);
    expect(input.required).toBe(true);
  });

  it("delegates focus and validity APIs and resets to its initial value", async () => {
    const element = document.createElement("emb-input") as EmbInput;
    const internals = {
      setFormValue: vi.fn(),
      setValidity: vi.fn()
    } satisfies TestInternals;
    (element as unknown as { internals?: TestInternals }).internals = internals;
    element.setAttribute("value", "seed");
    element.value = "seed";
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

    input.value = "changed";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("changed");

    element.formDisabledCallback(true);
    await element.updateComplete;
    expect(internals.setFormValue).toHaveBeenLastCalledWith(null);

    element.formDisabledCallback(false);
    await element.updateComplete;
    element.formResetCallback();
    await element.updateComplete;

    expect(element.value).toBe("seed");
    expect(input.value).toBe("seed");
  });
});
