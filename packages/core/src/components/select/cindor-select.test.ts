import "../../register.js";

import { CindorSelect } from "./cindor-select.js";

type TestInternals = Pick<ElementInternals, "setFormValue" | "setValidity">;

describe("cindor-select", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("defaults to the first available option when no value is provided", async () => {
    const element = document.createElement("cindor-select") as CindorSelect;
    element.innerHTML = `
      <option value="open">Open</option>
      <option value="closed">Closed</option>
    `;

    document.body.append(element);
    await element.updateComplete;

    expect(element.value).toBe("open");
    expect(element.renderRoot.querySelector("select")?.value).toBe("open");
  });

  it("hydrates options from light DOM and syncs host value", async () => {
    const element = document.createElement("cindor-select") as CindorSelect;
    element.innerHTML = `
      <option value="open">Open</option>
      <option value="closed">Closed</option>
    `;

    document.body.append(element);
    await element.updateComplete;

    const select = element.renderRoot.querySelector("select");

    expect(select).not.toBeNull();
    expect(select?.options.length).toBe(2);

    select!.value = "closed";
    select!.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("closed");
  });

  it("renders optgroups from light DOM", async () => {
    const element = document.createElement("cindor-select") as CindorSelect;
    element.innerHTML = `
      <optgroup label="Primary">
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </optgroup>
    `;

    document.body.append(element);
    await element.updateComplete;

    const group = element.renderRoot.querySelector("optgroup");

    expect(group?.getAttribute("label")).toBe("Primary");
    expect(group?.querySelectorAll("option")).toHaveLength(2);
    expect(element.value).toBe("open");
  });

  it("resets back to the initial value", async () => {
    const element = document.createElement("cindor-select") as CindorSelect;
    element.setAttribute("value", "open");
    element.value = "open";
    element.innerHTML = `
      <option value="open">Open</option>
      <option value="closed">Closed</option>
    `;

    document.body.append(element);
    await element.updateComplete;

    const select = element.renderRoot.querySelector("select") as HTMLSelectElement;
    select.value = "closed";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("closed");

    element.formResetCallback();
    await element.updateComplete;

    expect(element.value).toBe("open");
    expect(select.value).toBe("open");
  });

  it("maps host labelling attributes to internal shadow-safe accessibility references", async () => {
    const element = document.createElement("cindor-select") as CindorSelect;
    element.setAttribute("aria-label", "Status");
    element.setAttribute("aria-describedby", "status-help");
    document.body.innerHTML = `<div id="status-help">Choose the current status</div>`;
    element.innerHTML = `<option value="open">Open</option>`;
    document.body.append(element);
    await element.updateComplete;

    const select = element.renderRoot.querySelector("select");
    const describedById = select?.getAttribute("aria-describedby");
    const descriptionMirror = describedById ? element.renderRoot.querySelector(`#${describedById}`) : null;

    expect(select?.getAttribute("aria-label")).toBe("Status");
    expect(describedById).toMatch(/-description$/);
    expect(descriptionMirror?.textContent).toBe("Choose the current status");
  });

  it("redispatches input events and refreshes options when light DOM changes", async () => {
    const element = document.createElement("cindor-select") as CindorSelect;
    const onInput = vi.fn();
    element.addEventListener("input", onInput);
    element.innerHTML = `<option value="open">Open</option>`;
    document.body.append(element);
    await element.updateComplete;

    const addedOption = document.createElement("option");
    addedOption.value = "closed";
    addedOption.textContent = "Closed";
    element.append(addedOption);

    const slot = element.renderRoot.querySelector("slot") as HTMLSlotElement;
    slot.dispatchEvent(new Event("slotchange"));
    await element.updateComplete;

    const select = element.renderRoot.querySelector("select") as HTMLSelectElement;
    expect(select.options.length).toBe(2);

    select.value = "closed";
    select.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("closed");
    expect(onInput).toHaveBeenCalledTimes(1);
  });

  it("delegates focus and validity APIs and clears form state when disabled", async () => {
    const element = document.createElement("cindor-select") as CindorSelect;
    const internals = {
      setFormValue: vi.fn(),
      setValidity: vi.fn()
    } satisfies TestInternals;
    (element as unknown as { internals?: TestInternals }).internals = internals;
    element.innerHTML = `<option value="open">Open</option>`;
    document.body.append(element);
    await element.updateComplete;

    const select = element.renderRoot.querySelector("select") as HTMLSelectElement;
    select.checkValidity = vi.fn(() => false);
    select.reportValidity = vi.fn(() => false);
    select.focus = vi.fn();

    expect(element.checkValidity()).toBe(false);
    expect(element.reportValidity()).toBe(false);
    element.focus();
    expect(select.focus).toHaveBeenCalledTimes(1);

    element.formDisabledCallback(true);
    await element.updateComplete;

    expect(select.disabled).toBe(true);
    expect(internals.setFormValue).toHaveBeenLastCalledWith(null);
  });
});
