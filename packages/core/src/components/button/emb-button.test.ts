import "../../register.js";

import { EmbButton } from "./emb-button.js";

describe("emb-button", () => {
  it("renders a native button and forwards text content", async () => {
    const element = document.createElement("emb-button") as EmbButton;
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
    const element = document.createElement("emb-button") as EmbButton;
    element.setAttribute("aria-label", "Upload file");
    element.innerHTML = `
      <emb-icon slot="start-icon" name="upload"></emb-icon>
      Upload
      <emb-icon slot="end-icon" name="chevron-right"></emb-icon>
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
});
