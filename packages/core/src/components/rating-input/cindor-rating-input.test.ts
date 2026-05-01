import "../../register.js";

import { CindorRatingInput } from "./cindor-rating-input.js";

describe("cindor-rating-input", () => {
  it("updates the host value when a star is selected", async () => {
    const element = document.createElement("cindor-rating-input") as CindorRatingInput;
    document.body.append(element);
    await element.updateComplete;

    const radios = element.renderRoot.querySelectorAll("input");
    (radios[3] as HTMLInputElement).checked = true;
    radios[3]?.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe(4);
  });

  it("clears the selected rating when clearable", async () => {
    const element = document.createElement("cindor-rating-input") as CindorRatingInput;
    element.clearable = true;
    element.value = 4;
    document.body.append(element);
    await element.updateComplete;

    const clearButton = element.renderRoot.querySelector('[part="clear-button"]') as HTMLButtonElement;
    clearButton.click();
    await element.updateComplete;

    expect(element.value).toBe(0);
  });

  it("forwards accessible naming to the radiogroup", async () => {
    const element = document.createElement("cindor-rating-input") as CindorRatingInput;
    element.setAttribute("aria-label", "Review rating");
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[role="radiogroup"]')?.getAttribute("aria-label")).toBe("Review rating");
  });
});
