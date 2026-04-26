import "../../register.js";

import { EmbColorInput } from "./emb-color-input.js";

describe("emb-color-input", () => {
  it("renders a native color input with a visible swatch shell", async () => {
    const element = document.createElement("emb-color-input") as EmbColorInput;
    element.value = "#ff0000";
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");
    const swatch = element.renderRoot.querySelector('[part="swatch"]');
    const value = element.renderRoot.querySelector('[part="value"]');

    expect(input?.getAttribute("type")).toBe("color");
    expect(input?.value).toBe("#ff0000");
    expect(swatch).not.toBeNull();
    expect(value?.textContent).toContain("#FF0000");
  });

  it("uses the custom trigger to open the native color picker", async () => {
    const element = document.createElement("emb-color-input") as EmbColorInput;
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector('input[type="color"]') as HTMLInputElement & { showPicker?: () => void };
    const trigger = element.renderRoot.querySelector('[part="trigger"]') as HTMLButtonElement;
    let opened = false;

    input.showPicker = () => {
      opened = true;
    };

    trigger.click();

    expect(opened).toBe(true);
  });
});
