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
    const labelElement = input ? element.renderRoot.querySelector(`label[for="${input.id}"]`) : null;
    const describedById = input?.getAttribute("aria-describedby");
    const descriptionMirror = describedById ? element.renderRoot.querySelector(`#${describedById}`) : null;

    expect(input?.hasAttribute("aria-label")).toBe(false);
    expect(input?.hasAttribute("aria-labelledby")).toBe(false);
    expect(labelElement?.id).toMatch(/-label$/);
    expect(describedById).toMatch(/-description$/);
    expect(labelElement?.textContent?.trim()).toBe("Project name from label");
    expect(descriptionMirror?.textContent?.trim()).toBe("Used in URLs");
  });

  it("refreshes mirrored accessibility text when referenced content changes", async () => {
    const element = document.createElement("cindor-input") as CindorInput;
    element.setAttribute("aria-labelledby", "project-label");
    element.setAttribute("aria-describedby", "project-help");
    document.body.innerHTML = `
      <div id="project-label">Project name</div>
      <div id="project-help">Used in URLs</div>
    `;
    document.body.append(element);
    await element.updateComplete;

    const label = document.getElementById("project-label") as HTMLElement;
    const help = document.getElementById("project-help") as HTMLElement;
    label.textContent = "Archived project name";
    help.textContent = "Shown to collaborators";
    await Promise.resolve();
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    const labelElement = element.renderRoot.querySelector(`label[for="${input.id}"]`) as HTMLLabelElement;
    const descriptionMirror = element.renderRoot.querySelector(`#${input.getAttribute("aria-describedby") ?? ""}`) as HTMLSpanElement;

    expect(labelElement.textContent?.trim()).toBe("Archived project name");
    expect(descriptionMirror.textContent?.trim()).toBe("Shown to collaborators");
  });

  it("assigns a stable native control id even when no name is provided", async () => {
    const element = document.createElement("cindor-input") as CindorInput;
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");

    expect(input?.id).toMatch(/native-control$/);
  });

  it("keeps the native input labelled through a same-tree label element", async () => {
    const element = document.createElement("cindor-input") as CindorInput;
    element.setAttribute("aria-label", "Username");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    const label = element.renderRoot.querySelector(`label[for="${input.id}"]`) as HTMLLabelElement | null;

    expect(input.hasAttribute("aria-labelledby")).toBe(false);
    expect(label).not.toBeNull();
    expect(label?.textContent?.trim()).toBe("Username");
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

  it("forwards an existing owning form id to the native input", async () => {
    document.body.innerHTML = `<form id="login-form"><cindor-input name="username" aria-label="Username"></cindor-input></form>`;

    const element = document.querySelector("cindor-input") as CindorInput;
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(input.getAttribute("form")).toBe("login-form");
  });

  it("generates an owning form id when the form does not provide one", async () => {
    document.body.innerHTML = `<form><cindor-input name="username" aria-label="Username"></cindor-input></form>`;

    const form = document.querySelector("form") as HTMLFormElement;
    const element = document.querySelector("cindor-input") as CindorInput;
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(form.id).toMatch(/^cindor-form-\d+$/);
    expect(input.getAttribute("form")).toBe(form.id);
  });

  it("requests form submission when Enter is pressed in the native input", async () => {
    document.body.innerHTML = `<form><cindor-input name="username" aria-label="Username"></cindor-input></form>`;

    const form = document.querySelector("form") as HTMLFormElement;
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    const element = document.querySelector("cindor-input") as CindorInput;
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "Enter" }));

    expect(requestSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not request form submission on Enter when disabled", async () => {
    document.body.innerHTML = `<form><cindor-input disabled name="username" aria-label="Username"></cindor-input></form>`;

    const form = document.querySelector("form") as HTMLFormElement;
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    const element = document.querySelector("cindor-input") as CindorInput;
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "Enter" }));

    expect(requestSubmit).not.toHaveBeenCalled();
  });

  it("does not request form submission on Enter when readonly", async () => {
    document.body.innerHTML = `<form><cindor-input readonly name="username" aria-label="Username"></cindor-input></form>`;

    const form = document.querySelector("form") as HTMLFormElement;
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    const element = document.querySelector("cindor-input") as CindorInput;
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "Enter" }));

    expect(requestSubmit).not.toHaveBeenCalled();
  });

  it("does not request form submission during IME composition", async () => {
    document.body.innerHTML = `<form><cindor-input name="username" aria-label="Username"></cindor-input></form>`;

    const form = document.querySelector("form") as HTMLFormElement;
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    const element = document.querySelector("cindor-input") as CindorInput;
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    const event = new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "Enter" });
    Object.defineProperty(event, "isComposing", { value: true });

    input.dispatchEvent(event);

    expect(requestSubmit).not.toHaveBeenCalled();
  });

  it("does not crash or submit on Enter when not associated with a form", async () => {
    const element = document.createElement("cindor-input") as CindorInput;
    element.name = "username";
    element.setAttribute("aria-label", "Username");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(() => {
      input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "Enter" }));
    }).not.toThrow();
  });

  it("only applies username autocomplete when explicitly configured", async () => {
    const element = document.createElement("cindor-input") as CindorInput;
    element.name = "username";
    element.setAttribute("aria-label", "Username");
    element.autocomplete = "username";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(input.autocomplete).toBe("username");
    expect(element.getAttribute("autocomplete")).toBe("username");
  });

  it("leaves autocomplete unset when no explicit autocomplete is provided", async () => {
    const element = document.createElement("cindor-input") as CindorInput;
    element.name = "username";
    element.setAttribute("aria-label", "Username");
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    expect(input.getAttribute("autocomplete")).toBeNull();
    expect(element.autocomplete).toBe("");
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
