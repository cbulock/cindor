import "../../register.js";

import { EmbListbox } from "./emb-listbox.js";

describe("emb-listbox", () => {
  it("syncs active and selected state to slotted options", async () => {
    const element = document.createElement("emb-listbox") as EmbListbox;
    element.activeIndex = 1;
    element.selectedValue = "beta";
    element.innerHTML = '<emb-option value="alpha">Alpha</emb-option><emb-option value="beta">Beta</emb-option>';
    document.body.append(element);
    await element.updateComplete;

    const options = Array.from(element.children) as HTMLElement[];
    expect(element.getAttribute("role")).toBe("listbox");
    expect(options[0]?.hasAttribute("active")).toBe(false);
    expect(options[1]?.hasAttribute("active")).toBe(true);
    expect(options[1]?.hasAttribute("selected")).toBe(true);
  });
});
