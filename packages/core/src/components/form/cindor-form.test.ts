import "../../register.js";

import { CindorForm } from "./cindor-form.js";

describe("cindor-form", () => {
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
