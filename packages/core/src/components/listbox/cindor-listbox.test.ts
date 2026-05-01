import "../../register.js";

import { CindorListbox } from "./cindor-listbox.js";

describe("cindor-listbox", () => {
  it("syncs active and selected state to slotted options", async () => {
    const element = document.createElement("cindor-listbox") as CindorListbox;
    element.activeIndex = 1;
    element.selectedValue = "beta";
    element.innerHTML = '<cindor-option value="alpha">Alpha</cindor-option><cindor-option value="beta">Beta</cindor-option>';
    document.body.append(element);
    await element.updateComplete;

    const options = Array.from(element.children) as HTMLElement[];
    expect(element.getAttribute("role")).toBe("listbox");
    expect(options[0]?.hasAttribute("active")).toBe(false);
    expect(options[1]?.hasAttribute("active")).toBe(true);
    expect(options[1]?.hasAttribute("selected")).toBe(true);
  });
});
