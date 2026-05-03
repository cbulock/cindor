import "../../register.js";

import { CindorButton } from "./cindor-button.js";

describe("cindor-button", () => {
  it("renders a native button and forwards text content", async () => {
    const element = document.createElement("cindor-button") as CindorButton;
    element.textContent = "Save";
    document.body.append(element);
    await element.updateComplete;

    const button = element.renderRoot.querySelector("button");
    const slot = element.renderRoot.querySelector("slot");

    expect(button).not.toBeNull();
    expect(slot).not.toBeNull();
    expect(element.textContent?.trim()).toBe("Save");
    expect(button?.getAttribute("type")).toBe("button");
  });

  it("renders named icon slots and forwards aria labels", async () => {
    const element = document.createElement("cindor-button") as CindorButton;
    element.setAttribute("aria-label", "Upload file");
    element.innerHTML = `
      <cindor-icon slot="start-icon" name="upload"></cindor-icon>
      Upload
      <cindor-icon slot="end-icon" name="chevron-right"></cindor-icon>
    `;
    document.body.append(element);
    await element.updateComplete;

    const button = element.renderRoot.querySelector("button");
    const startSlot = element.renderRoot.querySelector('slot[name="start-icon"]');
    const endSlot = element.renderRoot.querySelector('slot[name="end-icon"]');

    expect(button?.getAttribute("aria-label")).toBe("Upload file");
    expect(startSlot).not.toBeNull();
    expect(endSlot).not.toBeNull();
  });

  it("submits its owning form when clicked without an explicit type", async () => {
    document.body.innerHTML = `<form><cindor-button>Save</cindor-button></form>`;

    const form = document.querySelector("form") as HTMLFormElement;
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    const element = document.querySelector("cindor-button") as CindorButton;
    await element.updateComplete;

    const button = element.renderRoot.querySelector("button") as HTMLButtonElement;

    button.click();

    expect(button.type).toBe("submit");
    expect(button.getAttribute("form")).toBe(form.id);
    expect(requestSubmit).toHaveBeenCalledTimes(1);
  });

  it("resets its owning form when configured as a reset button", async () => {
    document.body.innerHTML = `<form><cindor-button type="reset">Reset</cindor-button></form>`;

    const form = document.querySelector("form") as HTMLFormElement;
    const reset = vi.fn();
    form.reset = reset;

    const element = document.querySelector("cindor-button") as CindorButton;
    await element.updateComplete;

    const button = element.renderRoot.querySelector("button") as HTMLButtonElement;

    button.click();

    expect(button.type).toBe("reset");
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("does not submit its owning form when configured as a plain button", async () => {
    document.body.innerHTML = `<form><cindor-button type="button">Cancel</cindor-button></form>`;

    const form = document.querySelector("form") as HTMLFormElement;
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    const element = document.querySelector("cindor-button") as CindorButton;
    await element.updateComplete;

    const button = element.renderRoot.querySelector("button") as HTMLButtonElement;

    button.click();

    expect(button.type).toBe("button");
    expect(requestSubmit).not.toHaveBeenCalled();
  });

  it("does not submit when disabled", async () => {
    document.body.innerHTML = `<form><cindor-button disabled>Save</cindor-button></form>`;

    const form = document.querySelector("form") as HTMLFormElement;
    const requestSubmit = vi.fn();
    form.requestSubmit = requestSubmit;

    const element = document.querySelector("cindor-button") as CindorButton;
    await element.updateComplete;

    const button = element.renderRoot.querySelector("button") as HTMLButtonElement;

    button.click();

    expect(requestSubmit).not.toHaveBeenCalled();
  });

  it("submits the explicit target form instead of a nearby ancestor form", async () => {
    document.body.innerHTML = `
      <form id="ancestor-form">
        <div>
          <cindor-button form="target-form">Save</cindor-button>
        </div>
      </form>
      <form id="target-form"></form>
    `;

    const ancestorForm = document.getElementById("ancestor-form") as HTMLFormElement;
    const targetForm = document.getElementById("target-form") as HTMLFormElement;
    const ancestorSubmit = vi.fn();
    const targetSubmit = vi.fn();
    ancestorForm.requestSubmit = ancestorSubmit;
    targetForm.requestSubmit = targetSubmit;

    const element = document.querySelector("cindor-button") as CindorButton;
    await element.updateComplete;

    const button = element.renderRoot.querySelector("button") as HTMLButtonElement;

    button.click();

    expect(button.getAttribute("form")).toBe("target-form");
    expect(ancestorSubmit).not.toHaveBeenCalled();
    expect(targetSubmit).toHaveBeenCalledTimes(1);
  });

  it("defaults to a plain button outside forms", async () => {
    const element = document.createElement("cindor-button") as CindorButton;
    element.textContent = "Open";
    document.body.append(element);
    await element.updateComplete;

    const button = element.renderRoot.querySelector("button") as HTMLButtonElement;

    expect(button.type).toBe("button");
    expect(button.getAttribute("form")).toBeNull();
  });
});
