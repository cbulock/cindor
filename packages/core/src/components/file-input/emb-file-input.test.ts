import "../../register.js";

import { EmbFileInput } from "./emb-file-input.js";

describe("emb-file-input", () => {
  it("renders selected file names and switches labels for multiple files", async () => {
    const element = document.createElement("emb-file-input") as EmbFileInput;
    element.multiple = true;
    element.name = "uploads";
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

    Object.defineProperty(input, "files", {
      configurable: true,
      value: [file]
    });

    input.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="files"]')?.textContent).toContain("alpha.txt");

    Object.defineProperty(input, "files", {
      configurable: true,
      value: []
    });

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
});
