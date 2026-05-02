import "../../register.js";

import { CindorInput } from "./cindor-input.js";

type TestInternals = Pick<ElementInternals, "setFormValue" | "setValidity">;

describe("cindor-input", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("syncs host value from the native input element", async () => {
    const element = document.createElement("cindor-input") as CindorInput;
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

  it("maps host labelling attributes to internal shadow-safe accessibility references", async () => {
    const element = document.createElement("cindor-input") as CindorInput;
    element.setAttribute("aria-label", "Project name");
    element.setAttribute("aria-describedby", "project-help");
    element.setAttribute("aria-labelledby", "project-label");
    document.body.innerHTML = `
      <div id="project-label">Project name from label</div>
      <div id="project-help">Used in URLs</div>
    `;
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");
    const labelledById = input?.getAttribute("aria-labelledby");
    const describedById = input?.getAttribute("aria-describedby");
    const labelMirror = labelledById ? element.renderRoot.querySelector(`#${labelledById}`) : null;
    const descriptionMirror = describedById ? element.renderRoot.querySelector(`#${describedById}`) : null;

    expect(input?.hasAttribute("aria-label")).toBe(false);
    expect(labelledById).toMatch(/-label$/);
    expect(describedById).toMatch(/-description$/);
    expect(labelMirror?.textContent).toBe("Project name from label");
    expect(descriptionMirror?.textContent).toBe("Used in URLs");
  });

  it("assigns a stable native control id even when no name is provided", async () => {
    const element = document.createElement("cindor-input") as CindorInput;
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.id).toMatch(/native-control$/);
  });

  it("renders configured start and end icons", async () => {
    const element = document.createElement("cindor-input") as CindorInput;
    element.startIcon = "search";
    element.endIcon = "x";
    document.body.append(element);
    await element.updateComplete;

    const icons = element.renderRoot.querySelectorAll("cindor-icon");

    expect(icons).toHaveLength(2);
    expect(icons[0]?.getAttribute("name")).toBe("search");
    expect(icons[1]?.getAttribute("name")).toBe("x");
  });

  it("forwards core input attributes to the native control", async () => {
    const element = document.createElement("cindor-input") as CindorInput;
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
    const element = document.createElement("cindor-input") as CindorInput;
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
