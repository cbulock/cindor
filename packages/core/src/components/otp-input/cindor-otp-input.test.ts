import "../../register.js";
import { CindorOtpInput } from "./cindor-otp-input.js";

describe("cindor-otp-input", () => {
  let element: CindorOtpInput;
  const cells = () => Array.from(element.renderRoot.querySelectorAll("input"));
  const type = async (text: string, index = 0) => {
    cells()[index].value = text;
    cells()[index].dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
    await element.updateComplete;
  };
  const key = async (name: string, index = 0) => {
    cells()[index].dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true }));
    await element.updateComplete;
  };
  const paste = async (text: string, index = 0) => {
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", { value: { getData: () => text } });
    cells()[index].dispatchEvent(event);
    await element.updateComplete;
  };
  beforeEach(async () => {
    element = document.createElement("cindor-otp-input") as CindorOtpInput;
    document.body.append(element);
    await element.updateComplete;
  });
  afterEach(() => element.remove());

  it("normalizes lengths and silent property values without reflecting secrets", async () => {
    const input = vi.fn(); element.addEventListener("input", input);
    expect(cells()).toHaveLength(6);
    for (const length of [0, -1, 1.5, Infinity, NaN]) {
      element.length = length; await element.updateComplete; expect(cells()).toHaveLength(6);
    }
    element.length = 4; element.value = "00x123"; await element.updateComplete;
    expect(element.value).toBe("0012"); expect(cells()).toHaveLength(4);
    expect(element.hasAttribute("value")).toBe(false); expect(input).not.toHaveBeenCalled();
    element.value = ""; await element.updateComplete; expect(cells().every(cell => cell.value === "")).toBe(true);
    element.mode = "alphanumeric"; element.value = "aB-09"; await element.updateComplete;
    expect(element.value).toBe("aB09");
  });

  it("replaces characters, auto advances and keeps deletion contiguous", async () => {
    await type("0"); expect(element.value).toBe("0"); expect(element.shadowRoot?.activeElement).toBe(cells()[1]);
    await type("1", 1); await type("2", 2); await type("9", 1); expect(element.value).toBe("092");
    await key("Delete", 1); expect(element.value).toBe("02");
    await key("Backspace", 2); expect(element.value).toBe("0"); expect(element.shadowRoot?.activeElement).toBe(cells()[1]);
    await key("Backspace", 0); expect(element.value).toBe("");
  });

  it("handles virtual keyboard deletion without keydown", async () => {
    await type("12");
    const input = vi.fn(); element.addEventListener("input", input);
    const remove = async (inputType: string, index: number) => {
      const event = new InputEvent("beforeinput", { inputType, bubbles: true, cancelable: true });
      cells()[index].dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
      await element.updateComplete;
    };
    await remove("deleteContentBackward", 2);
    expect(element.value).toBe("1");
    expect(element.shadowRoot?.activeElement).toBe(cells()[1]);
    expect(input).toHaveBeenCalledTimes(1);
    await remove("deleteContentBackward", 1);
    expect(element.value).toBe("");
    await remove("deleteContentBackward", 0);
    expect(input).toHaveBeenCalledTimes(2);
    await type("123");
    await remove("deleteContentForward", 1);
    expect(element.value).toBe("13");
    element.readonly = true; await element.updateComplete;
    await remove("deleteContentBackward", 1);
    expect(element.value).toBe("13");
  });

  it("uses a single roving tab stop with arrow and endpoint navigation", async () => {
    expect(cells().filter(cell => cell.tabIndex === 0)).toHaveLength(1);
    expect(element.tabIndex).toBe(-1);
    await key("End"); expect(element.shadowRoot?.activeElement).toBe(cells()[5]);
    await key("ArrowLeft", 5); expect(element.shadowRoot?.activeElement).toBe(cells()[4]);
    await key("Home", 4); await key("ArrowRight"); expect(element.shadowRoot?.activeElement).toBe(cells()[1]);
    element.focus(); expect(element.shadowRoot?.activeElement).toBe(cells()[1]);
    expect(cells().filter(cell => cell.tabIndex === 0)).toHaveLength(1);
  });

  it("replaces a character with collapsed selections and advances on unchanged typing", async () => {
    element.value = "123456"; await element.updateComplete;
    const input = vi.fn(), complete = vi.fn();
    element.addEventListener("input", input); element.addEventListener("complete", complete);
    for (const caret of [0, 1]) {
      element.value = "123456"; await element.updateComplete;
      const cell = cells()[2]; cell.focus(); cell.setSelectionRange(caret, caret);
      const before = new InputEvent("beforeinput", { inputType: "insertText", data: "9", bubbles: true, cancelable: true });
      cell.dispatchEvent(before);
      expect(before.defaultPrevented).toBe(true);
      await element.updateComplete;
      expect(element.value).toBe("129456");
      expect(element.shadowRoot?.activeElement).toBe(cells()[3]);
    }
    // Non-cancelable beforeinput falls back to the inserted data on input.
    cells()[2].value = "39";
    cells()[2].dispatchEvent(new InputEvent("input", { inputType: "insertText", data: "9", bubbles: true }));
    await element.updateComplete;
    expect(element.value).toBe("129456");
    input.mockClear(); complete.mockClear();
    cells()[0].focus();
    await type("1");
    expect(element.shadowRoot?.activeElement).toBe(cells()[1]);
    expect(input).not.toHaveBeenCalled(); expect(complete).not.toHaveBeenCalled();
    await type("8", 1); expect(element.value).toBe("189456");
  });

  it("distributes full, partial and overflow paste and autofill", async () => {
    await paste("00 12-34", 3); expect(element.value).toBe("001234");
    await paste("99", 2); expect(element.value).toBe("009934");
    await paste("123456789", 5); expect(element.value).toBe("123456");
    await type("654321", 0); expect(element.value).toBe("654321");
    await paste("unsupported"); expect(element.value).toBe("654321");
  });

  it("emits input then complete once per effective edit, commits once and never submits", async () => {
    const events: string[] = [];
    for (const name of ["input", "complete", "change"]) element.addEventListener(name, event => {
      expect(event.bubbles).toBe(true); expect(event.composed).toBe(true); events.push(name);
      if (name === "complete") expect((event as CustomEvent).detail.value).toBe(element.value);
    });
    const form = document.createElement("form"); document.body.append(form); form.append(element);
    const submit = vi.fn(); form.addEventListener("submit", submit);
    await paste("123456"); await paste("123456"); expect(events).toEqual(["input", "complete"]);
    await key("Enter", 5); await key("Enter", 5);
    cells()[5].dispatchEvent(new Event("change", { bubbles: true }));
    cells()[5].dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: document.body }));
    expect(events).toEqual(["input", "complete", "change"]); expect(submit).not.toHaveBeenCalled();
    await type("7", 0); cells()[0].dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: document.body }));
    expect(events.slice(-3)).toEqual(["input", "complete", "change"]); form.remove();
  });

  it("defers composition normalization until completion", async () => {
    const input = vi.fn(); element.addEventListener("input", input);
    cells()[0].dispatchEvent(new CompositionEvent("compositionstart"));
    await type("１"); expect(element.value).toBe(""); expect(input).not.toHaveBeenCalled();
    cells()[0].value = "12";
    cells()[0].dispatchEvent(new CompositionEvent("compositionend")); await element.updateComplete;
    expect(element.value).toBe("12"); expect(input).toHaveBeenCalledTimes(1);
  });

  it("validates required and incomplete values and supports reset and fieldset disable", async () => {
    expect(element.checkValidity()).toBe(true);
    element.required = true; await element.updateComplete; expect(element.checkValidity()).toBe(false);
    await type("1"); expect(element.checkValidity()).toBe(false);
    await paste("123456"); expect(element.checkValidity()).toBe(true);
    element.invalid = true; await element.updateComplete; expect(element.checkValidity()).toBe(false);
    element.formDisabledCallback(true); await element.updateComplete;
    await type("9"); expect(element.value).toBe("123456"); expect(cells().every(cell => cell.disabled)).toBe(true);
    element.formDisabledCallback(false); element.invalid = false; element.formResetCallback(); await element.updateComplete;
    expect(element.value).toBe(""); expect(element.checkValidity()).toBe(false);
  });

  it("synchronizes one form value, validity flags and a silent controlled replacement", async () => {
    const internals = { setFormValue: vi.fn(), setValidity: vi.fn() };
    (element as unknown as { internals: typeof internals }).internals = internals;
    element.required = true; await element.updateComplete;
    expect(internals.setValidity).toHaveBeenLastCalledWith({ valueMissing: true }, "Enter the code.", cells()[0]);
    await type("0"); expect(internals.setFormValue).toHaveBeenLastCalledWith("0");
    expect(internals.setValidity).toHaveBeenLastCalledWith({ customError: true }, "Enter all 6 characters.", cells()[0]);
    const change = vi.fn(); element.addEventListener("change", change);
    element.value = ""; await element.updateComplete; await key("Enter"); expect(change).not.toHaveBeenCalled();
    element.disabled = true; await element.updateComplete; expect(internals.setFormValue).toHaveBeenLastCalledWith(null);
    expect(cells().every(cell => !cell.name)).toBe(true);
  });

  it("composes form-field labels and error descriptions", async () => {
    const field = document.createElement("cindor-form-field") as HTMLElement & { updateComplete: Promise<boolean> };
    field.setAttribute("label", "Code"); field.setAttribute("error", "Expired code");
    document.body.append(field); field.append(element); element.invalid = true;
    await field.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 0)); await element.updateComplete;
    const group = element.renderRoot.querySelector('[role="group"]')!;
    expect(group.getAttribute("aria-label")).toBe("Code"); expect(group.getAttribute("aria-invalid")).toBe("true");
    const id = group.getAttribute("aria-describedby");
    expect(element.renderRoot.querySelector(`#${id}`)?.textContent).toContain("Expired code");
    field.remove();
  });

  it("masks display and prevents disabled/readonly edits while readonly stays navigable", async () => {
    element.value = "012345"; element.masked = true; element.readonly = true; await element.updateComplete;
    expect(cells().every(cell => cell.type === "password")).toBe(true);
    await paste("999999"); await key("Delete"); await type("9"); expect(element.value).toBe("012345");
    await key("End"); expect(element.shadowRoot?.activeElement).toBe(cells()[5]);
    element.disabled = true; await element.updateComplete; expect(cells().every(cell => cell.tabIndex === -1)).toBe(true);
  });

  it("mirrors labels and descriptions into the group across shadow boundaries", async () => {
    const label = document.createElement("span"); label.id = "otp-label"; label.textContent = "Verification code";
    const help = document.createElement("span"); help.id = "otp-help"; help.textContent = "Check your phone";
    document.body.append(label, help);
    element.setAttribute("aria-labelledby", label.id); element.setAttribute("aria-describedby", help.id);
    await new Promise(resolve => setTimeout(resolve, 0)); await element.updateComplete;
    const group = element.renderRoot.querySelector('[role="group"]')!;
    expect(group.getAttribute("aria-label")).toBe("Verification code");
    const description = group.getAttribute("aria-describedby")!;
    expect(element.renderRoot.querySelector(`#${description}`)?.textContent).toBe("Check your phone");
    expect(cells()[0].getAttribute("aria-label")).toBe("Character 1 of 6");
    expect(cells().filter(cell => cell.hasAttribute("aria-describedby"))).toHaveLength(1);
    label.remove(); help.remove();
  });
});
