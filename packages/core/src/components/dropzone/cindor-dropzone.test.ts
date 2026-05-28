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

  it("updates surface active state during drag interactions", async () => {
    const element = document.createElement("cindor-dropzone") as CindorDropzone;
    document.body.append(element);
    await element.updateComplete;

    const surface = element.renderRoot.querySelector('[part="surface"]') as HTMLElement;

    const dragEnterEvent = new Event("dragenter", { bubbles: true, cancelable: true }) as DragEvent;
    surface.dispatchEvent(dragEnterEvent);
    expect(surface.getAttribute("data-active")).toBe("true");

    const dragOverEvent = new Event("dragover", { bubbles: true, cancelable: true }) as DragEvent;
    surface.dispatchEvent(dragOverEvent);
    expect(surface.getAttribute("data-active")).toBe("true");

    const dragLeaveEvent = new Event("dragleave", { bubbles: true, cancelable: true }) as DragEvent;
    Object.defineProperty(dragLeaveEvent, "relatedTarget", { configurable: true, value: null });
    surface.dispatchEvent(dragLeaveEvent);
    expect(surface.getAttribute("data-active")).toBe("false");

    surface.dispatchEvent(dragOverEvent);
    expect(surface.getAttribute("data-active")).toBe("true");

    const dropEvent = new Event("drop", { bubbles: true, cancelable: true }) as DragEvent;
    Object.defineProperty(dropEvent, "dataTransfer", {
      configurable: true,
      value: { files: [] }
    });
    surface.dispatchEvent(dropEvent);
    expect(surface.getAttribute("data-active")).toBe("false");
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
