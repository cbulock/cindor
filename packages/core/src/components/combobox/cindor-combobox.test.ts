import "../../register.js";

import { CindorCombobox } from "./cindor-combobox.js";

describe("cindor-combobox", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("filters options from typed input and commits with keyboard selection", async () => {
    const element = document.createElement("cindor-combobox") as CindorCombobox;
    element.innerHTML = '<cindor-option value="Alpha">Alpha</cindor-option><cindor-option value="Beta">Beta</cindor-option><cindor-option value="Gamma">Gamma</cindor-option>';
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;

    input.value = "ga";
    input.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
    await element.updateComplete;

    const options = element.renderRoot.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(1);
    expect(options[0]?.textContent?.trim()).toBe("Gamma");
    expect(input.getAttribute("aria-activedescendant")).toBeTruthy();

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("Gamma");
    expect(input.value).toBe("Gamma");
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("supports arrow navigation and closes on escape", async () => {
    const element = document.createElement("cindor-combobox") as CindorCombobox;
    element.innerHTML = '<cindor-option value="Alpha">Alpha</cindor-option><cindor-option value="Beta">Beta</cindor-option><cindor-option value="Gamma">Gamma</cindor-option>';
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    input.dispatchEvent(new FocusEvent("focus"));
    await element.updateComplete;

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await element.updateComplete;
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await element.updateComplete;

    const options = element.renderRoot.querySelectorAll('[role="option"]');
    expect(options[2]?.hasAttribute("active")).toBe(true);

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[role="listbox"]')).toBeNull();
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("renders a styled listbox from light DOM options", async () => {
    const element = document.createElement("cindor-combobox") as CindorCombobox;
    element.innerHTML = '<cindor-option value="Alpha">Alpha</cindor-option><cindor-option value="Beta">Beta</cindor-option>';
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");
    input?.dispatchEvent(new FocusEvent("focus"));
    await element.updateComplete;
    await Promise.resolve();

    const options = element.renderRoot.querySelectorAll('[role="option"]');

    expect(options).toHaveLength(2);
    expect(options[0]?.textContent?.trim()).toBe("Alpha");
    expect((options[0] as HTMLElement)?.getAttribute("tabindex")).toBeNull();
  });

  it("selects an option from the custom popup", async () => {
    const element = document.createElement("cindor-combobox") as CindorCombobox;
    element.innerHTML = '<cindor-option value="Alpha">Alpha</cindor-option><cindor-option value="Beta">Beta</cindor-option>';
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");
    input?.dispatchEvent(new FocusEvent("focus"));
    await element.updateComplete;

    const options = element.renderRoot.querySelectorAll('[role="option"]');
    (options[1] as HTMLElement)?.click();
    await element.updateComplete;

    expect(element.value).toBe("Beta");
    expect(input?.value).toBe("Beta");
  });

  it("does not open suggestions when disabled", async () => {
    const element = document.createElement("cindor-combobox") as CindorCombobox;
    element.disabled = true;
    element.innerHTML = '<cindor-option value="Alpha">Alpha</cindor-option><cindor-option value="Beta">Beta</cindor-option>';
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    input.dispatchEvent(new FocusEvent("focus"));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[role="listbox"]')).toBeNull();
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("skips disabled options during keyboard navigation", async () => {
    const element = document.createElement("cindor-combobox") as CindorCombobox;
    element.innerHTML =
      '<cindor-option value="Alpha">Alpha</cindor-option><cindor-option value="Beta" disabled>Beta</cindor-option><cindor-option value="Gamma">Gamma</cindor-option>';
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    input.dispatchEvent(new FocusEvent("focus"));
    await element.updateComplete;

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await element.updateComplete;

    const options = element.renderRoot.querySelectorAll("cindor-option");
    expect(options[2]?.hasAttribute("active")).toBe(true);
  });

  it("closes the popup and clears the active descendant on blur", async () => {
    const element = document.createElement("cindor-combobox") as CindorCombobox;
    element.innerHTML = '<cindor-option value="Alpha">Alpha</cindor-option><cindor-option value="Beta">Beta</cindor-option>';
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    input.dispatchEvent(new FocusEvent("focus"));
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[role="listbox"]')).not.toBeNull();

    input.dispatchEvent(new FocusEvent("blur"));
    await Promise.resolve();
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[role="listbox"]')).toBeNull();
    expect(input.getAttribute("aria-activedescendant")).toBeNull();
  });

  it("supports freeform changes and refreshes options after slot updates", async () => {
    const element = document.createElement("cindor-combobox") as CindorCombobox;
    const onChange = vi.fn();
    element.addEventListener("change", onChange);
    element.innerHTML = '<cindor-option value="Alpha">Alpha</cindor-option><cindor-option value="Beta">Beta</cindor-option>';
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    input.value = "Delta";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("Delta");
    expect(onChange).toHaveBeenCalledTimes(1);

    const option = document.createElement("cindor-option");
    option.setAttribute("value", "Delta");
    option.textContent = "Delta";
    element.append(option);

    const slot = element.renderRoot.querySelector("slot") as HTMLSlotElement;
    slot.dispatchEvent(new Event("slotchange"));
    await element.updateComplete;

    input.dispatchEvent(new FocusEvent("focus"));
    await element.updateComplete;

    const options = element.renderRoot.querySelectorAll('[role="option"]');
    expect(options).toHaveLength(1);
    expect(options[0]?.textContent?.trim()).toBe("Delta");
  });
});
