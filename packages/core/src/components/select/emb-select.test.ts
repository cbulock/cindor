import "../../register.js";

import { EmbSelect } from "./emb-select.js";

describe("emb-select", () => {
  it("defaults to the first available option when no value is provided", async () => {
    const element = document.createElement("emb-select") as EmbSelect;
    element.innerHTML = `
      <option value="open">Open</option>
      <option value="closed">Closed</option>
    `;

    document.body.append(element);
    await element.updateComplete;

    expect(element.value).toBe("open");
    expect(element.renderRoot.querySelector("select")?.value).toBe("open");
  });

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

  it("renders optgroups from light DOM", async () => {
    const element = document.createElement("emb-select") as EmbSelect;
    element.innerHTML = `
      <optgroup label="Primary">
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </optgroup>
    `;

    document.body.append(element);
    await element.updateComplete;

    const group = element.renderRoot.querySelector("optgroup");

    expect(group?.getAttribute("label")).toBe("Primary");
    expect(group?.querySelectorAll("option")).toHaveLength(2);
    expect(element.value).toBe("open");
  });

  it("resets back to the initial value", async () => {
    const element = document.createElement("emb-select") as EmbSelect;
    element.setAttribute("value", "open");
    element.value = "open";
    element.innerHTML = `
      <option value="open">Open</option>
      <option value="closed">Closed</option>
    `;

    document.body.append(element);
    await element.updateComplete;

    const select = element.renderRoot.querySelector("select") as HTMLSelectElement;
    select.value = "closed";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("closed");

    element.formResetCallback();
    await element.updateComplete;

    expect(element.value).toBe("open");
    expect(select.value).toBe("open");
  });

  it("forwards host labelling attributes to the internal select", async () => {
    const element = document.createElement("emb-select") as EmbSelect;
    element.setAttribute("aria-label", "Status");
    element.innerHTML = `<option value="open">Open</option>`;
    document.body.append(element);
    await element.updateComplete;

    const select = element.renderRoot.querySelector("select");

    expect(select?.getAttribute("aria-label")).toBe("Status");
  });
});
