import "../../register.js";

import { EmbSelect } from "./emb-select.js";

describe("emb-select", () => {
  it("hydrates options from light DOM and syncs host value", async () => {
    const element = document.createElement("emb-select") as EmbSelect;
    element.innerHTML = `
      <option value="open">Open</option>
      <option value="closed">Closed</option>
    `;

    document.body.append(element);
    await element.updateComplete;

    const select = element.renderRoot.querySelector("select");

    expect(select).not.toBeNull();
    expect(select?.options.length).toBe(2);

    select!.value = "closed";
    select!.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("closed");
  });
});
