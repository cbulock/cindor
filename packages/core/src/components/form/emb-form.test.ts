import "../../register.js";

import { EmbForm } from "./emb-form.js";

describe("emb-form", () => {
  it("projects native validation into emb-form-field messaging", async () => {
    const element = document.createElement("emb-form") as EmbForm;
    element.innerHTML = `
      <form>
        <emb-form-field label="Email">
          <input name="email" required />
        </emb-form-field>
      </form>
    `;
    document.body.append(element);
    await element.updateComplete;

    expect(element.reportValidity()).toBe(false);
    await element.updateComplete;

    const field = element.querySelector("emb-form-field") as HTMLElement & { validationError: string };

    expect(field.validationError).not.toBe("");
    expect(element.shadowRoot?.textContent).toContain("field");
  });

  it("disables managed controls while submitting", async () => {
    const element = document.createElement("emb-form") as EmbForm;
    element.innerHTML = `
      <form>
        <emb-form-field label="Name">
          <emb-input name="name"></emb-input>
        </emb-form-field>
      </form>
    `;
    document.body.append(element);
    await element.updateComplete;

    const control = element.querySelector("emb-input") as HTMLElement & { disabled: boolean };

    expect(control.disabled).toBe(false);

    element.submitting = true;
    await element.updateComplete;
    expect(control.disabled).toBe(true);

    element.submitting = false;
    await element.updateComplete;
    expect(control.disabled).toBe(false);
  });

  it("validates before proxying requestSubmit", async () => {
    const element = document.createElement("emb-form") as EmbForm;
    element.innerHTML = `
      <form>
        <emb-form-field label="Name">
          <input name="name" required />
        </emb-form-field>
      </form>
    `;
    document.body.append(element);
    await element.updateComplete;

    const form = element.querySelector("form") as HTMLFormElement;
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    element.requestSubmit();
    expect(requestSubmit).not.toHaveBeenCalled();

    const input = form.querySelector("input") as HTMLInputElement;
    input.value = "Emberline";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await element.updateComplete;

    element.requestSubmit();
    expect(requestSubmit).toHaveBeenCalledTimes(1);
  });
});
