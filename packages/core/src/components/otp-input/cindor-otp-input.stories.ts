import { expect, userEvent } from "storybook/test";
import type { CindorForm } from "../form/cindor-form.js";
import type { CindorOtpInput } from "./cindor-otp-input.js";
import { html } from "lit";

const meta = {
  title: "Components/OTP Input",
  args: { value: "", length: 6, mode: "numeric", masked: false, disabled: false, readonly: false, invalid: false },
  render: (args: { value: string; length: number; mode: string; masked: boolean; disabled: boolean; readonly: boolean; invalid: boolean }) => html`
    <cindor-form-field label="Verification code" description="Enter the code sent to your phone. Arrow keys move between characters."
      error=${args.invalid ? "This code has expired. Request another code." : ""}>
      <cindor-otp-input .value=${args.value} .length=${args.length} mode=${args.mode}
        ?masked=${args.masked} ?disabled=${args.disabled} ?readonly=${args.readonly} ?invalid=${args.invalid}></cindor-otp-input>
    </cindor-form-field>`
};
export default meta;
export const Numeric = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const control = canvasElement.querySelector("cindor-otp-input") as CindorOtpInput;
    await control.updateComplete;
    const cells = Array.from(control.shadowRoot!.querySelectorAll("input"));
    cells[0].focus(); cells[0].value = "012345";
    cells[0].dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
    await control.updateComplete;
    expect(control.value).toBe("012345");
    expect(control.shadowRoot!.activeElement).toBe(cells[5]);
    expect(cells.filter(cell => cell.tabIndex === 0)).toHaveLength(1);
    cells[5].dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    await control.updateComplete;
    expect(control.shadowRoot!.activeElement).toBe(cells[0]);
    cells[2].focus(); cells[2].setSelectionRange(1, 1);
    await userEvent.type(cells[2], "9", { skipClick: true });
    await control.updateComplete;
    expect(control.value).toBe("019345");
    expect(control.shadowRoot!.activeElement).toBe(cells[3]);
    cells[0].focus();
    await userEvent.type(cells[0], "0", { skipClick: true });
    await control.updateComplete;
    expect(control.shadowRoot!.activeElement).toBe(cells[1]);
  }
};
export const Alphanumeric = { args: { mode: "alphanumeric", value: "Ab09", length: 4 } };
export const Masked = { args: { masked: true, value: "012345" } };
export const Disabled = { args: { disabled: true, value: "012345" } };
export const Readonly = { args: { readonly: true, value: "012345" } };
export const Invalid = { args: { invalid: true, value: "012345" } };
export const Controlled = {
  render: () => {
    let value = "";
    return html`<cindor-otp-input aria-label="Verification code" .value=${value} @input=${(event: Event) => {
      const control = event.target as HTMLElement & { value: string };
      value = control.value;
      control.value = value;
    }}></cindor-otp-input>
    <button @click=${(event: Event) => {
      value = "";
      const control = (event.currentTarget as HTMLElement).previousElementSibling as HTMLElement & { value: string };
      control.value = value;
    }}>Clear code</button>`;
  }
};

export const FormValidation = {
  render: () => html`<cindor-form><cindor-form-field label="Verification code">
    <cindor-otp-input required name="code"></cindor-otp-input>
  </cindor-form-field></cindor-form>`,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const form = canvasElement.querySelector("cindor-form") as CindorForm;
    const control = canvasElement.querySelector("cindor-otp-input") as CindorOtpInput;
    const field = canvasElement.querySelector("cindor-form-field") as HTMLElement & { validationError: string };
    await form.updateComplete;
    for (const [value, invalid, message] of [
      ["", false, "Enter the code."],
      ["123", false, "Enter all 6 characters."],
      ["123456", true, "The code is invalid."],
      ["123456", false, ""]
    ] as const) {
      control.value = value; control.invalid = invalid; await control.updateComplete;
      expect(control.checkValidity()).toBe(!message);
      expect(form.checkValidity()).toBe(!message);
      expect(form.reportValidity()).toBe(!message);
      await form.updateComplete;
      expect(field.validationError).toBe(message);
      if (message) expect(form.shadowRoot!.textContent).toContain("Verification code");
      else expect(form.shadowRoot!.textContent).not.toContain("still need attention");
    }
  }
};
