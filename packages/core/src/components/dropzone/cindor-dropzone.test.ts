import "../../register.js";

import { CindorDropzone } from "./cindor-dropzone.js";

describe("cindor-dropzone", () => {
  it("renders dropped or selected files as chips", async () => {
    const element = document.createElement("cindor-dropzone") as CindorDropzone;
    element.multiple = true;
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector('input[type="file"]') as HTMLInputElement;
    const fileOne = new File(["alpha"], "alpha.txt", { type: "text/plain" });
    const fileTwo = new File(["beta"], "beta.txt", { type: "text/plain" });

    Object.defineProperty(input, "files", {
      configurable: true,
      value: [fileOne, fileTwo]
    });

    input.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.renderRoot.querySelectorAll("cindor-chip")).toHaveLength(2);
    expect(element.renderRoot.querySelector('[part="summary"]')?.textContent).toContain("alpha.txt");
    expect(element.renderRoot.querySelector('[part="summary"]')?.textContent).toContain("beta.txt");
  });

  it("accepts drag and drop files", async () => {
    const element = document.createElement("cindor-dropzone") as CindorDropzone;
    document.body.append(element);
    await element.updateComplete;

    const file = new File(["gamma"], "gamma.txt", { type: "text/plain" });
    const surface = element.renderRoot.querySelector('[part="surface"]') as HTMLElement;
    const dropEvent = new Event("drop", { bubbles: true, cancelable: true }) as DragEvent;

    Object.defineProperty(dropEvent, "dataTransfer", {
      configurable: true,
      value: { files: [file] }
    });

    surface.dispatchEvent(dropEvent);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="summary"]')?.textContent).toContain("gamma.txt");
  });

  it("does not open the picker when disabled", async () => {
    const element = document.createElement("cindor-dropzone") as CindorDropzone;
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
});
