import "../../register.js";

import { CindorForm } from "./cindor-form.js";
import type { CindorOtpInput } from "../otp-input/cindor-otp-input.js";

describe("cindor-form", () => {
  it("honors aggregate OTP validity in checks, field errors and the summary", async () => {
    const form = document.createElement("cindor-form") as CindorForm;
    form.innerHTML = '<cindor-form-field label="Verification code"><cindor-otp-input required name="code"></cindor-otp-input></cindor-form-field>';
    document.body.append(form); await form.updateComplete;
    const otp = form.querySelector("cindor-otp-input") as CindorOtpInput;
    const field = form.querySelector("cindor-form-field") as HTMLElement & { validationError: string };
    // Simulate the browser's synchronous invalid dispatch from ElementInternals.
    const check = vi.spyOn(otp, "checkValidity").mockImplementation(() => {
      const valid = otp.validity.valid;
      if (!valid) otp.dispatchEvent(new Event("invalid", { cancelable: true }));
      return valid;
    });
    vi.spyOn(otp, "reportValidity").mockImplementation(() => otp.checkValidity());
    try {
      for (const [value, invalid, message] of [
        ["", false, "Enter the code."],
        ["123", false, "Enter all 6 characters."],
        ["123456", true, "The code is invalid."],
        ["123456", false, ""]
      ] as const) {
        otp.value = value; otp.invalid = invalid; await otp.updateComplete;
        expect(otp.shadowRoot?.querySelector("input")?.validity.valid).toBe(true);
        expect(otp.checkValidity()).toBe(!message);
        expect(check).toHaveBeenCalledTimes(1);
        check.mockClear();
        expect(form.checkValidity()).toBe(!message);
        expect(form.reportValidity()).toBe(!message);
        check.mockClear();
        await form.updateComplete;
        expect(field.validationError).toBe(message);
        if (message) expect(form.shadowRoot?.textContent).toContain("Verification code");
        else expect(form.shadowRoot?.textContent).not.toContain("still need attention");
      }
    } finally { form.remove(); }
  });
  it("projects validation into cindor-form-field messaging for direct children", async () => {
    const element = document.createElement("cindor-form") as CindorForm;
    element.innerHTML = `
      <cindor-form-field label="Email">
        <input name="email" required />
      </cindor-form-field>
    `;
    document.body.append(element);
    await element.updateComplete;

    expect(element.reportValidity()).toBe(false);
    await element.updateComplete;

    const field = element.querySelector("cindor-form-field") as HTMLElement & { validationError: string };

    expect(field.validationError).not.toBe("");
    expect(element.shadowRoot?.textContent).toContain("field");
  });

  it("submits from a direct-child button", async () => {
    const element = document.createElement("cindor-form") as CindorForm;
    element.innerHTML = `
      <cindor-form-field label="Name">
        <cindor-input name="name" value="Cindor"></cindor-input>
      </cindor-form-field>
      <cindor-button type="submit">Save</cindor-button>
    `;
    const handleSubmit = vi.fn((event: Event) => event.preventDefault());
    element.addEventListener("submit", handleSubmit);
    document.body.append(element);
    await element.updateComplete;

    const button = element.querySelector("cindor-button") as HTMLElement;
    button.click();
    await element.updateComplete;

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("disables managed controls while submitting", async () => {
    const element = document.createElement("cindor-form") as CindorForm;
    element.innerHTML = `
      <cindor-form-field label="Name">
        <cindor-input name="name"></cindor-input>
      </cindor-form-field>
    `;
    document.body.append(element);
    await element.updateComplete;

    const control = element.querySelector("cindor-input") as HTMLElement & { disabled: boolean };

    expect(control.disabled).toBe(false);

    element.submitting = true;
    await element.updateComplete;
    expect(control.disabled).toBe(true);

    element.submitting = false;
    await element.updateComplete;
    expect(control.disabled).toBe(false);
  });

  it("validates before proxying requestSubmit for direct children", async () => {
    const element = document.createElement("cindor-form") as CindorForm;
    element.innerHTML = `
      <cindor-form-field label="Name">
        <input name="name" required />
      </cindor-form-field>
    `;
    document.body.append(element);
    await element.updateComplete;

    const form = element.shadowRoot?.querySelector("form") as HTMLFormElement;
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    element.requestSubmit();
    expect(requestSubmit).not.toHaveBeenCalled();

    const input = element.querySelector("input") as HTMLInputElement;
    input.value = "Cindor";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await element.updateComplete;

    element.requestSubmit();
    expect(requestSubmit).toHaveBeenCalledTimes(1);
  });

  it("forwards owned-form submit events from the host", async () => {
    const element = document.createElement("cindor-form") as CindorForm;
    element.innerHTML = `
      <cindor-form-field label="Name">
        <input name="name" value="Cindor" required />
      </cindor-form-field>
    `;
    const handleSubmit = vi.fn((event: Event) => event.preventDefault());
    element.addEventListener("submit", handleSubmit);
    document.body.append(element);
    await element.updateComplete;

    const form = element.shadowRoot?.querySelector("form") as HTMLFormElement;
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("keeps supporting a nested native form", async () => {
    const element = document.createElement("cindor-form") as CindorForm;
    element.innerHTML = `
      <form>
        <cindor-form-field label="Name">
          <input name="name" required />
        </cindor-form-field>
      </form>
    `;
    document.body.append(element);
    await element.updateComplete;

    const form = element.querySelector("form") as HTMLFormElement;
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    const input = form.querySelector("input") as HTMLInputElement;
    input.value = "Cindor";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await element.updateComplete;

    element.requestSubmit();
    expect(requestSubmit).toHaveBeenCalledTimes(1);
  });
});
