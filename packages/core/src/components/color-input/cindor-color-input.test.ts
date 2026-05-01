import "../../register.js";

import { CindorColorInput } from "./cindor-color-input.js";

describe("cindor-color-input", () => {
  it("renders a native color input with a visible swatch shell", async () => {
    const element = document.createElement("cindor-color-input") as CindorColorInput;
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
    const element = document.createElement("cindor-color-input") as CindorColorInput;
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
