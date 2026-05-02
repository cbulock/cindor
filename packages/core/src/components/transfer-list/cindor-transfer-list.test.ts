import "../../register.js";

import { CindorTransferList } from "./cindor-transfer-list.js";

describe("cindor-transfer-list", () => {
  it("preserves distinct native control ids when syncing accessibility metadata", async () => {
    document.body.innerHTML = `<div id="transfer-help">Use the buttons to move items.</div>`;
    const element = document.createElement("cindor-transfer-list") as CindorTransferList;
    element.setAttribute("aria-describedby", "transfer-help");
    element.innerHTML = '<option value="design">Design</option><option value="engineering">Engineering</option>';
    document.body.append(element);
    await element.updateComplete;

    const availableSelect = element.renderRoot.querySelector('[part="available-select"]') as HTMLSelectElement;
    const selectedSelect = element.renderRoot.querySelector('[part="selected-select"]') as HTMLSelectElement;
    const availableDescriptionId = availableSelect.getAttribute("aria-describedby");
    const selectedDescriptionId = selectedSelect.getAttribute("aria-describedby");
    const availableDescription = availableDescriptionId ? element.renderRoot.querySelector(`#${availableDescriptionId}`) : null;
    const selectedDescription = selectedDescriptionId ? element.renderRoot.querySelector(`#${selectedDescriptionId}`) : null;

    expect(availableSelect.id).toBe("available-list");
    expect(selectedSelect.id).toBe("selected-list");
    expect(availableDescriptionId).toBe("available-list-description");
    expect(selectedDescriptionId).toBe("selected-list-description");
    expect(availableDescription?.textContent).toBe("Use the buttons to move items.");
    expect(selectedDescription?.textContent).toBe("Use the buttons to move items.");
  });

  it("moves selected available options into the chosen list", async () => {
    const element = document.createElement("cindor-transfer-list") as CindorTransferList;
    element.innerHTML =
      '<option value="design">Design</option><option value="engineering">Engineering</option><option value="product">Product</option>';
    document.body.append(element);
    await element.updateComplete;

    const availableSelect = element.renderRoot.querySelector('[part="available-select"]') as HTMLSelectElement;
    availableSelect.options[0].selected = true;
    availableSelect.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    await element.updateComplete;

    (element.renderRoot.querySelector('[part="add-button"]') as HTMLButtonElement).click();
    await element.updateComplete;

    expect(element.selectedValues).toEqual(["design"]);
    expect((element.renderRoot.querySelector('[part="selected-select"]') as HTMLSelectElement).options[0]?.textContent).toBe("Design");
  });

  it("marks itself invalid when required and empty", async () => {
    const element = document.createElement("cindor-transfer-list") as CindorTransferList;
    element.required = true;
    element.innerHTML = '<option value="design">Design</option><option value="engineering">Engineering</option>';
    document.body.append(element);
    await element.updateComplete;

    expect(element.checkValidity()).toBe(false);
    expect((element.renderRoot.querySelector('[part="selected-select"]') as HTMLSelectElement).getAttribute("aria-invalid")).toBe(
      "true"
    );
  });
});
