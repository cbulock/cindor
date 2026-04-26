import "../../register.js";

import { EmbFileInput } from "./emb-file-input.js";

describe("emb-file-input", () => {
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
    const trigger = element.renderRoot.querySelector('[part="trigger"]') as HTMLButtonElement;
    let clicked = false;
    input.click = () => {
      clicked = true;
    };

    trigger.click();

    expect(clicked).toBe(true);
  });
});
