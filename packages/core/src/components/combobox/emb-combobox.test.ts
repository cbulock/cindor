import "../../register.js";

import { EmbCombobox } from "./emb-combobox.js";

describe("emb-combobox", () => {
  it("renders a styled listbox from light DOM options", async () => {
    const element = document.createElement("emb-combobox") as EmbCombobox;
    element.innerHTML = '<option value="Alpha">Alpha</option><option value="Beta">Beta</option>';
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");
    input?.dispatchEvent(new FocusEvent("focus"));
    await element.updateComplete;
    await Promise.resolve();

    const options = element.renderRoot.querySelectorAll('[role="option"]');

    expect(options).toHaveLength(2);
    expect(options[0]?.textContent?.trim()).toBe("Alpha");
  });

  it("selects an option from the custom popup", async () => {
    const element = document.createElement("emb-combobox") as EmbCombobox;
    element.innerHTML = '<option value="Alpha">Alpha</option><option value="Beta">Beta</option>';
    document.body.append(element);
    await element.updateComplete;

    const input = element.renderRoot.querySelector("input");
    input?.dispatchEvent(new FocusEvent("focus"));
    await element.updateComplete;

    const options = element.renderRoot.querySelectorAll('[role="option"]');
    options[1]?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    options[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("Beta");
    expect(input?.value).toBe("Beta");
  });
});
