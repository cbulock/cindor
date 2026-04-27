import "../../register.js";

import { EmbCombobox } from "./emb-combobox.js";

describe("emb-combobox", () => {
  it("filters options from typed input and commits with keyboard selection", async () => {
    const element = document.createElement("emb-combobox") as EmbCombobox;
    element.innerHTML = '<emb-option value="Alpha">Alpha</emb-option><emb-option value="Beta">Beta</emb-option><emb-option value="Gamma">Gamma</emb-option>';
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
    const element = document.createElement("emb-combobox") as EmbCombobox;
    element.innerHTML = '<emb-option value="Alpha">Alpha</emb-option><emb-option value="Beta">Beta</emb-option><emb-option value="Gamma">Gamma</emb-option>';
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
    const element = document.createElement("emb-combobox") as EmbCombobox;
    element.innerHTML = '<emb-option value="Alpha">Alpha</emb-option><emb-option value="Beta">Beta</emb-option>';
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
    const element = document.createElement("emb-combobox") as EmbCombobox;
    element.innerHTML = '<emb-option value="Alpha">Alpha</emb-option><emb-option value="Beta">Beta</emb-option>';
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
    const element = document.createElement("emb-combobox") as EmbCombobox;
    element.disabled = true;
    element.innerHTML = '<emb-option value="Alpha">Alpha</emb-option><emb-option value="Beta">Beta</emb-option>';
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
    const element = document.createElement("emb-combobox") as EmbCombobox;
    element.innerHTML =
      '<emb-option value="Alpha">Alpha</emb-option><emb-option value="Beta" disabled>Beta</emb-option><emb-option value="Gamma">Gamma</emb-option>';
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input") as HTMLInputElement;
    input.dispatchEvent(new FocusEvent("focus"));
    await element.updateComplete;

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await element.updateComplete;

    const options = element.renderRoot.querySelectorAll("emb-option");
    expect(options[2]?.hasAttribute("active")).toBe(true);
  });
});
