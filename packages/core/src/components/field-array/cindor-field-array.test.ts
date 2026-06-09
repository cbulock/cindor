import { html } from "lit";
import { afterEach } from "vitest";

import "../../register.js";

import { CindorFieldArray } from "./cindor-field-array.js";

type ContactItem = {
  description?: string;
  id: string;
  label: string;
  meta?: string;
};

describe("cindor-field-array", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the empty state when there are no items", async () => {
    const element = document.createElement("cindor-field-array") as CindorFieldArray<ContactItem>;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="empty"]')).not.toBeNull();
    expect(element.value).toBe("[]");
  });

  it("adds items, updates the serialized value, and emits input detail", async () => {
    const element = document.createElement("cindor-field-array") as CindorFieldArray<ContactItem>;
    element.createItem = ({ items }) => ({
      id: `contact-${items.length + 1}`,
      label: `Contact ${items.length + 1}`
    });
    const inputListener = vi.fn();
    element.addEventListener("input", inputListener);
    document.body.append(element);
    await element.updateComplete;

    (element as unknown as { addItem: () => void }).addItem();
    await element.updateComplete;

    expect(element.items).toHaveLength(1);
    expect(element.value).toBe(JSON.stringify([{ id: "contact-1", label: "Contact 1" }]));
    expect(inputListener.mock.calls[0]?.[0].detail).toMatchObject({
      action: "add",
      index: 0,
      item: { id: "contact-1", label: "Contact 1" }
    });
  });

  it("removes and reorders items while preserving serialized state", async () => {
    const element = document.createElement("cindor-field-array") as CindorFieldArray<ContactItem>;
    element.items = [
      { id: "first", label: "First" },
      { id: "second", label: "Second" },
      { id: "third", label: "Third" }
    ];
    document.body.append(element);
    await element.updateComplete;

    (element as unknown as { moveItem: (fromIndex: number, toIndex: number) => void }).moveItem(0, 2);
    await element.updateComplete;
    expect(element.items.map((item) => item.id)).toEqual(["second", "third", "first"]);

    (element as unknown as { removeItem: (index: number) => void }).removeItem(1);
    await element.updateComplete;
    expect(element.items.map((item) => item.id)).toEqual(["second", "first"]);
    expect(element.value).toBe(JSON.stringify([{ id: "second", label: "Second" }, { id: "first", label: "First" }]));
  });

  it("reports invalid state when the minimum item count is not met", async () => {
    const element = document.createElement("cindor-field-array") as CindorFieldArray<ContactItem>;
    element.minItems = 1;
    document.body.append(element);
    await element.updateComplete;

    expect(element.checkValidity()).toBe(false);
    expect(element.renderRoot.textContent).toContain("Add at least one item.");
  });

  it("uses the custom item renderer when provided", async () => {
    const element = document.createElement("cindor-field-array") as CindorFieldArray<ContactItem>;
    element.items = [{ id: "primary", label: "Primary contact" }];
    element.renderItem = ({ item, index }) => html`<div class="custom-row">${index + 1}. ${item.label}</div>`;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector(".custom-row")?.textContent).toContain("1. Primary contact");
  });
});
