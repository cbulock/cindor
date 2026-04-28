import "../../register.js";

import type { FilterBuilderField } from "./emb-filter-builder.js";
import { EmbFilterBuilder } from "./emb-filter-builder.js";

const fields: FilterBuilderField[] = [
  {
    label: "Status",
    options: [
      { label: "Open", value: "open" },
      { label: "Closed", value: "closed" }
    ],
    type: "select",
    value: "status"
  },
  {
    label: "Owner",
    placeholder: "Type a teammate name",
    type: "text",
    value: "owner"
  }
];

describe("emb-filter-builder", () => {
  it("initializes a default rule from the provided fields", async () => {
    const element = document.createElement("emb-filter-builder") as EmbFilterBuilder;
    element.fields = fields;
    document.body.append(element);
    await element.updateComplete;

    const ruleField = element.renderRoot.querySelector(".rule select.field") as HTMLSelectElement;
    expect(ruleField.value).toBe("status");
    expect(JSON.parse(element.value)).toMatchObject({
      children: [{ field: "status", operator: "is", type: "rule", value: "open" }],
      logic: "and",
      type: "group"
    });
  });

  it("adds a nested group when requested", async () => {
    const element = document.createElement("emb-filter-builder") as EmbFilterBuilder;
    element.fields = fields;
    document.body.append(element);
    await element.updateComplete;

    const addGroupButton = Array.from(element.renderRoot.querySelectorAll("button")).find((button) => button.textContent?.includes("Add group"));
    addGroupButton?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await element.updateComplete;

    expect(element.renderRoot.querySelectorAll("fieldset").length).toBe(2);
    expect(JSON.parse(element.value).children).toHaveLength(2);
  });
});
