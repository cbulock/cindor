import { afterEach } from "vitest";

import "../../register.js";

import type { FilterBuilderField } from "./cindor-filter-builder.js";
import { CindorFilterBuilder } from "./cindor-filter-builder.js";

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

describe("cindor-filter-builder", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it(
    "initializes a default rule from the provided fields",
    async () => {
    const element = document.createElement("cindor-filter-builder") as CindorFilterBuilder;
    element.fields = fields;
    document.body.append(element);
    await element.updateComplete;

    const ruleField = element.renderRoot.querySelector(".rule cindor-select") as HTMLElement & { value: string };
    expect(ruleField.value).toBe("status");
    expect(element.renderRoot.querySelector("cindor-fieldset")).not.toBeNull();
    expect(element.renderRoot.querySelector("cindor-form-field cindor-select")).not.toBeNull();
    expect(element.renderRoot.querySelector("cindor-button")).not.toBeNull();
    expect(JSON.parse(element.value)).toMatchObject({
      children: [{ field: "status", operator: "is", type: "rule", value: "open" }],
      logic: "and",
      type: "group"
    });
    },
    10000
  );

  it(
    "adds a nested group when requested",
    async () => {
    const element = document.createElement("cindor-filter-builder") as CindorFilterBuilder;
    element.fields = fields;
    document.body.append(element);
    await element.updateComplete;

    const addGroupButton = Array.from(element.renderRoot.querySelectorAll("cindor-button")).find((button) =>
      button.textContent?.includes("Add group")
    ) as HTMLElement | undefined;
    addGroupButton?.click();
    await element.updateComplete;

    expect(element.renderRoot.querySelectorAll("cindor-fieldset").length).toBe(2);
    expect(JSON.parse(element.value).children).toHaveLength(2);
    },
    10000
  );
});
