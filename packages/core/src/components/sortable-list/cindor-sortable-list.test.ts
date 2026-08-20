import { html } from "lit";
import { afterEach } from "vitest";

import "../../register.js";

import type { CindorSortableList } from "./cindor-sortable-list.js";

type SortableItem = {
  id: string;
  label: string;
};

describe("cindor-sortable-list", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the empty message when there are no items", async () => {
    const element = document.createElement("cindor-sortable-list") as CindorSortableList;
    element.emptyMessage = "No ranked items yet.";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="empty"]')?.textContent).toContain("No ranked items yet.");
  });

  it("moves an item with the button controls and emits reorder detail", async () => {
    const element = document.createElement("cindor-sortable-list") as CindorSortableList<SortableItem>;
    element.items = createItems();
    const reorderListener = vi.fn();
    element.addEventListener("reorder", reorderListener);
    document.body.append(element);
    await element.updateComplete;

    (element as unknown as { moveItem: (fromIndex: number, toIndex: number, reason: "button") => void }).moveItem(0, 1, "button");
    await element.updateComplete;

    expect(element.items.map((item) => item.id)).toEqual(["second", "first", "third"]);
    expect(reorderListener).toHaveBeenCalledTimes(1);
    expect(reorderListener.mock.calls[0]?.[0].detail).toMatchObject({
      oldIndex: 0,
      newIndex: 1,
      reason: "button"
    });
  });

  it("moves an item with drag and drop and emits the drag reorder reason", async () => {
    const element = document.createElement("cindor-sortable-list") as CindorSortableList<SortableItem>;
    element.items = createItems();
    const reorderListener = vi.fn();
    element.addEventListener("reorder", reorderListener);
    document.body.append(element);
    await element.updateComplete;

    const rows = element.renderRoot.querySelectorAll<HTMLElement>('[part="item"]');
    rows[0]?.dispatchEvent(createDragEvent("dragstart"));
    rows[2]?.dispatchEvent(createDragEvent("dragover"));
    rows[2]?.dispatchEvent(createDragEvent("drop"));
    await element.updateComplete;

    expect(element.items.map((item) => item.id)).toEqual(["second", "third", "first"]);
    expect(reorderListener).toHaveBeenCalledTimes(1);
    expect(reorderListener.mock.calls[0]?.[0].detail).toMatchObject({
      oldIndex: 0,
      newIndex: 2,
      reason: "drag"
    });
  });

  it("keeps the drag handle decorative for accessibility", async () => {
    const element = document.createElement("cindor-sortable-list") as CindorSortableList<SortableItem>;
    element.items = createItems();
    document.body.append(element);
    await element.updateComplete;

    const dragHandle = element.renderRoot.querySelector<HTMLElement>('[part="drag-handle"]');

    expect(dragHandle?.getAttribute("aria-hidden")).toBe("true");
    expect(dragHandle?.hasAttribute("aria-label")).toBe(false);
  });

  it("uses the custom renderer when provided", async () => {
    const element = document.createElement("cindor-sortable-list") as CindorSortableList<SortableItem>;
    element.items = createItems();
    element.renderItem = ({ item, index }) => html`<span class="custom-row">${index + 1}. ${item.label}</span>`;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector(".custom-row")?.textContent).toContain("1. First");
  });
});

function createItems(): SortableItem[] {
  return [
    { id: "first", label: "First" },
    { id: "second", label: "Second" },
    { id: "third", label: "Third" }
  ];
}

function createDragEvent(type: string): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "dataTransfer", {
    configurable: true,
    value: {
      dropEffect: "move",
      effectAllowed: "move",
      setData: vi.fn()
    }
  });
  return event;
}
