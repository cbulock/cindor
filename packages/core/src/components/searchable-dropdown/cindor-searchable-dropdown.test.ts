import "../../register.js";
import { CindorSearchableDropdown } from "./cindor-searchable-dropdown.js";

describe("cindor-searchable-dropdown", () => {
  afterEach(() => { document.body.innerHTML = ""; });
  it("initializes selected children appended after connection and restores them on reset", async () => {
    const element = document.createElement("cindor-searchable-dropdown") as CindorSearchableDropdown;
    document.body.append(element);
    await element.updateComplete;
    element.innerHTML = '<option value="a" selected>Alpha</option><option value="b">Bravo</option>';
    await new Promise(resolve => setTimeout(resolve, 0));
    await element.updateComplete;
    expect(element.value).toBe("a");
    expect(element.selectedLabel).toBe("Alpha");
    element.focus();
    await element.updateComplete;
    (element.renderRoot.querySelectorAll("cindor-option")[1] as HTMLElement).click();
    await element.updateComplete;
    expect(element.value).toBe("b");
    element.formResetCallback();
    await element.updateComplete;
    expect(element.value).toBe("a");
  });

  it("preserves explicit values when initially selected children arrive later", async () => {
    for (const value of ["", "b"]) {
      const element = document.createElement("cindor-searchable-dropdown") as CindorSearchableDropdown;
      element.setAttribute("value", value);
      document.body.append(element);
      await element.updateComplete;
      element.innerHTML = '<option value="a" selected>Alpha</option><option value="b">Bravo</option>';
      await new Promise(resolve => setTimeout(resolve, 0));
      await element.updateComplete;
      expect(element.value).toBe(value);
      element.value = "a";
      await element.updateComplete;
      element.formResetCallback();
      await element.updateComplete;
      expect(element.value).toBe(value);
    }
  });

  it("names the popup from the resolved control label and updates referenced text", async () => {
    const label = document.createElement("span");
    label.id = "dropdown-label";
    label.textContent = "Choose a role";
    document.body.append(label);
    const { element, input, key } = await setup();
    element.setAttribute("aria-label", "Fallback");
    element.setAttribute("aria-labelledby", label.id);
    await key("ArrowDown");
    const listbox = element.renderRoot.querySelector("cindor-listbox")!;
    expect(listbox.getAttribute("aria-label")).toBe("Choose a role");
    expect(listbox.getAttribute("aria-label")).toBe(input.getAttribute("aria-label"));
    label.textContent = "Updated role";
    await new Promise(resolve => setTimeout(resolve, 0));
    await element.updateComplete;
    expect(listbox.getAttribute("aria-label")).toBe("Updated role");
  });
  async function setup() {
    const element = document.createElement("cindor-searchable-dropdown") as CindorSearchableDropdown;
    element.innerHTML = '<option value="a">Alpha</option><cindor-option value="b" disabled>Beta</cindor-option><cindor-option value="g">Gamma</cindor-option>';
    document.body.append(element);
    await element.updateComplete;
    const input = element.renderRoot.querySelector("input")!;
    const key = async (key: string, isComposing = false) => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key, isComposing }));
      await element.updateComplete;
    };
    const type = async (value: string) => {
      input.value = value;
      input.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
      await element.updateComplete;
    };
    return { element, input, key, type };
  }
  it("separates query, label and value and emits only changed selections", async () => {
    const { element, input, key, type } = await setup();
    const events: string[] = [];
    for (const name of ["input", "change"]) element.addEventListener(name, () => events.push(name + element.value));
    element.value = "a";
    await element.updateComplete;
    await type("gam");
    expect(element.value).toBe("a");
    expect(events).toEqual([]);
    await key("Enter", true);
    expect(element.value).toBe("a");
    await key("Enter");
    expect(element.value).toBe("g");
    expect(input.value).toBe("Gamma");
    expect(events).toEqual(["inputg", "changeg"]);
    await key("ArrowDown");
    await key("Enter");
    expect(events).toHaveLength(2);
  });
  it("cancels unmatched text and reopens with valid ARIA targets", async () => {
    const { element, input, key, type } = await setup();
    element.value = "a";
    await element.updateComplete;
    await type("zzz");
    expect(element.renderRoot.querySelector('[role="status"]')?.textContent).toBe("No matching options");
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
    await key("Escape");
    expect(input.value).toBe("Alpha");
    await key("ArrowDown");
    expect(element.renderRoot.querySelectorAll("cindor-listbox cindor-option")).toHaveLength(3);
    await key("ArrowDown");
    const active = element.renderRoot.querySelector("#" + input.getAttribute("aria-activedescendant"));
    expect(active?.textContent?.trim()).toBe("Gamma");
    expect(element.renderRoot.querySelector("#" + input.getAttribute("aria-controls"))).toBeTruthy();
    input.dispatchEvent(new FocusEvent("blur"));
    await element.updateComplete;
    expect(input.value).toBe("Alpha");
  });
  it("validates selection and resolves pending values after option insertion", async () => {
    const { element, type, key } = await setup();
    element.required = true;
    await type("Alpha");
    expect(element.checkValidity()).toBe(false);
    await key("Enter");
    expect(element.checkValidity()).toBe(true);
    element.value = "future";
    await element.updateComplete;
    expect(element.selectedLabel).toBe("");
    expect(element.checkValidity()).toBe(false);
    element.insertAdjacentHTML("beforeend", '<option value="future">Future</option>');
    await new Promise(resolve => setTimeout(resolve, 0));
    await element.updateComplete;
    expect(element.selectedLabel).toBe("Future");
    element.formResetCallback();
    await element.updateComplete;
    expect(element.value).toBe("");
    element.disabled = true;
    await element.updateComplete;
    await key("ArrowDown");
    expect(element.renderRoot.querySelector("cindor-listbox")).toBeNull();
  });
  it("handles pointer selection, initial options and option label mutation", async () => {
    const element = document.createElement("cindor-searchable-dropdown") as CindorSearchableDropdown;
    element.innerHTML = '<option value="a" selected>Alpha</option><cindor-option value="b">Bravo</cindor-option>';
    document.body.append(element);
    await element.updateComplete;
    expect(element.value).toBe("a");
    const input = element.renderRoot.querySelector("input")!;
    input.dispatchEvent(new FocusEvent("focus"));
    await element.updateComplete;
    const option = element.renderRoot.querySelectorAll("cindor-option")[1] as HTMLElement;
    option.click();
    await element.updateComplete;
    expect(element.value).toBe("b");
    element.children[1].textContent = "Updated";
    await new Promise(resolve => setTimeout(resolve, 0));
    await element.updateComplete;
    expect(input.value).toBe("Updated");
    element.formResetCallback();
    await element.updateComplete;
    expect(element.value).toBe("a");
  });

  it("keeps form disability separate and restores interaction on re-enabling", async () => {
    const { element, input, key } = await setup();
    input.focus();
    await element.updateComplete;
    element.formDisabledCallback(true);
    await element.updateComplete;
    expect(element.disabled).toBe(false);
    expect(element.hasAttribute("disabled")).toBe(false);
    expect(input.disabled).toBe(true);
    expect(element.open).toBe(false);
    await key("ArrowDown");
    expect(element.open).toBe(false);
    element.formDisabledCallback(false);
    await element.updateComplete;
    expect(input.disabled).toBe(false);
    await key("ArrowDown");
    expect(element.open).toBe(true);
    element.disabled = true;
    await element.updateComplete;
    element.formDisabledCallback(false);
    await element.updateComplete;
    expect(input.disabled).toBe(true);
  });

  it("preserves the initial reset value across reconnection", async () => {
    const element = document.createElement("cindor-searchable-dropdown") as CindorSearchableDropdown;
    element.innerHTML = '<option value="a" selected>Alpha</option><option value="b">Bravo</option>';
    document.body.append(element);
    await element.updateComplete;
    element.focus();
    await element.updateComplete;
    (element.renderRoot.querySelectorAll("cindor-option")[1] as HTMLElement).click();
    await element.updateComplete;
    expect(element.value).toBe("b");
    element.remove();
    document.body.append(element);
    await element.updateComplete;
    element.formResetCallback();
    await element.updateComplete;
    expect(element.value).toBe("a");
    expect(element.selectedLabel).toBe("Alpha");
  });

  it("reopens on clicking the focused input after selection and Escape", async () => {
    const { element, input, key, type } = await setup();
    input.focus();
    await element.updateComplete;
    await type("gam");
    await key("Enter");
    expect(element.shadowRoot!.activeElement).toBe(input);
    expect(element.open).toBe(false);
    input.click();
    await element.updateComplete;
    expect(element.open).toBe(true);
    expect(input.value).toBe("");
    expect(element.renderRoot.querySelectorAll("cindor-listbox cindor-option")).toHaveLength(3);
    expect(element.renderRoot.querySelector("#" + input.getAttribute("aria-activedescendant"))?.textContent?.trim()).toBe("Gamma");
    await key("Escape");
    input.click();
    await element.updateComplete;
    expect(element.open).toBe(true);
  });

});
