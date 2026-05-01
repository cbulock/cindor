import "../../register.js";

import { EmbFileInput } from "./emb-file-input.js";

type TestInternals = Pick<ElementInternals, "setFormValue" | "setValidity">;

function setFiles(input: HTMLInputElement, files: File[]): void {
  Object.defineProperty(input, "files", {
    configurable: true,
    value: files
  });
}

describe("emb-file-input", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders selected file names and switches labels for multiple files", async () => {
    const element = document.createElement("emb-file-input") as EmbFileInput;
    element.multiple = true;
    element.name = "uploads";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector('input[type="file"]') as HTMLInputElement;
    const fileOne = new File(["alpha"], "alpha.txt", { type: "text/plain" });
    const fileTwo = new File(["beta"], "beta.txt", { type: "text/plain" });

    setFiles(input, [fileOne, fileTwo]);

    input.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="trigger"]')?.textContent).toContain("Choose files");
    expect(element.renderRoot.querySelector('[part="label"]')?.textContent).toContain("Selected files");
    expect(element.renderRoot.querySelectorAll("emb-chip")).toHaveLength(2);
    expect(element.renderRoot.querySelector('[part="files"]')?.textContent).toContain("alpha.txt");
    expect(element.renderRoot.querySelector('[part="files"]')?.textContent).toContain("beta.txt");
  });

  it("clears the summary when the native input selection is emptied", async () => {
    const element = document.createElement("emb-file-input") as EmbFileInput;
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["alpha"], "alpha.txt", { type: "text/plain" });

    setFiles(input, [file]);

    input.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="files"]')?.textContent).toContain("alpha.txt");

    setFiles(input, []);

    input.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="files"]')?.textContent).toContain("No files selected");
  });

  it("renders a hidden native file input with a custom trigger", async () => {
    const element = document.createElement("emb-file-input") as EmbFileInput;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('input[type="file"]')).not.toBeNull();
    expect(element.renderRoot.querySelector('[part="trigger"]')?.textContent).toContain("Choose file");
    expect(element.renderRoot.querySelector('[part="trigger-icon"]')).not.toBeNull();
    expect(element.renderRoot.querySelector('[part="files"]')?.textContent).toContain("No files selected");
  });

  it("uses the custom trigger to open the native file picker", async () => {
    const element = document.createElement("emb-file-input") as EmbFileInput;
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector('input[type="file"]') as HTMLInputElement;
    const trigger = element.renderRoot.querySelector('[part="trigger"]') as HTMLElement;
    let clicked = false;
    input.click = () => {
      clicked = true;
    };

    trigger.click();

    expect(clicked).toBe(true);
  });

  it("does not trigger the picker when disabled", async () => {
    const element = document.createElement("emb-file-input") as EmbFileInput;
    element.disabled = true;
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector('input[type="file"]') as HTMLInputElement;
    const trigger = element.renderRoot.querySelector('[part="trigger"]') as HTMLElement;
    let clicked = false;
    input.click = () => {
      clicked = true;
    };

    trigger.click();

    expect(clicked).toBe(false);
  });

  it("forwards host aria-label to the native file input", async () => {
    const element = document.createElement("emb-file-input") as EmbFileInput;
    element.setAttribute("aria-label", "Upload assets");
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('input[type="file"]')?.getAttribute("aria-label")).toBe("Upload assets");
  });

  it("stores selected files in form state for single and multiple uploads", async () => {
    const element = document.createElement("emb-file-input") as EmbFileInput;
    const internals = {
      setFormValue: vi.fn(),
      setValidity: vi.fn()
    } satisfies TestInternals;
    (element as unknown as { internals?: TestInternals }).internals = internals;
    element.name = "uploads";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector('input[type="file"]') as HTMLInputElement;
    const singleFile = new File(["alpha"], "alpha.txt", { type: "text/plain" });
    setFiles(input, [singleFile]);

    input.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(internals.setFormValue).toHaveBeenLastCalledWith(singleFile);

    element.multiple = true;
    await element.updateComplete;

    const secondFile = new File(["beta"], "beta.txt", { type: "text/plain" });
    setFiles(input, [singleFile, secondFile]);

    input.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    const formData = internals.setFormValue.mock.calls.at(-1)?.[0];
    expect(formData).toBeInstanceOf(FormData);
    expect((formData as FormData).getAll("uploads")).toEqual([singleFile, secondFile]);
  });

  it("clears form state on reset and delegates input APIs", async () => {
    const element = document.createElement("emb-file-input") as EmbFileInput;
    const internals = {
      setFormValue: vi.fn(),
      setValidity: vi.fn()
    } satisfies TestInternals;
    (element as unknown as { internals?: TestInternals }).internals = internals;
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["alpha"], "alpha.txt", { type: "text/plain" });
    setFiles(input, [file]);
    Object.defineProperty(input, "value", {
      configurable: true,
      writable: true,
      value: "C:\\fakepath\\alpha.txt"
    });
    input.checkValidity = vi.fn(() => false);
    input.reportValidity = vi.fn(() => false);
    input.focus = vi.fn();

    input.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.checkValidity()).toBe(false);
    expect(element.reportValidity()).toBe(false);

    element.focus();
    expect(input.focus).toHaveBeenCalledTimes(1);

    setFiles(input, []);
    element.formResetCallback();

    expect(input.value).toBe("");
    expect(internals.setFormValue).toHaveBeenLastCalledWith(null);
  });
});
