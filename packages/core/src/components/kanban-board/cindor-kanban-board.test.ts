import "../../register.js";

import { CindorKanbanBoard, type KanbanBoardColumn } from "./cindor-kanban-board.js";

const columns: KanbanBoardColumn[] = [
  {
    id: "triage",
    title: "Triage",
    cards: [
      {
        id: "card-a",
        title: "Review inbound bugs",
        description: "Trim duplicates and identify release blockers.",
        meta: "2 owners",
        tags: ["Bug", "Urgent"],
        actions: [{ key: "assign", label: "Assign" }]
      }
    ]
  },
  {
    id: "ready",
    title: "Ready for build",
    cards: []
  }
];

const dispatchDragEvent = (target: Element, type: "dragstart" | "dragover" | "drop" | "dragend") => {
  const event = new Event(type, { bubbles: true, cancelable: true }) as DragEvent;
  Object.defineProperty(event, "dataTransfer", {
    value: {
      dropEffect: "none",
      effectAllowed: "none",
      setData: vi.fn()
    }
  });
  target.dispatchEvent(event);
  return event;
};

describe("cindor-kanban-board", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders column headers and empty-column messaging", async () => {
    const element = document.createElement("cindor-kanban-board") as CindorKanbanBoard;
    element.columns = columns;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[data-column-id="triage"] [part="column-title"]')?.textContent).toContain("Triage");
    expect(element.renderRoot.querySelector('[data-column-id="ready"] [part="empty-column"]')?.textContent).toContain("No cards in this column.");
  });

  it("selects a card on click and emits select details", async () => {
    const element = document.createElement("cindor-kanban-board") as CindorKanbanBoard;
    element.columns = columns;
    const selectListener = vi.fn();
    element.addEventListener("select", selectListener);
    document.body.append(element);
    await element.updateComplete;

    (element.renderRoot.querySelector('[data-card-id="card-a"] [part="card-surface"]') as HTMLElement).click();
    await element.updateComplete;

    expect(element.selectedCardId).toBe("card-a");
    expect(selectListener.mock.calls.at(-1)?.[0].detail.columnId).toBe("triage");
    expect(selectListener.mock.calls.at(-1)?.[0].detail.card.title).toBe("Review inbound bugs");
  });

  it("supports keyboard selection", async () => {
    const element = document.createElement("cindor-kanban-board") as CindorKanbanBoard;
    element.columns = columns;
    document.body.append(element);
    await element.updateComplete;

    const surface = element.renderRoot.querySelector('[data-card-id="card-a"] [part="card-surface"]') as HTMLElement;
    surface.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "Enter" }));
    await element.updateComplete;

    expect(element.selectedCardId).toBe("card-a");
  });

  it("moves focus between interactive cards with arrow, home, and end keys", async () => {
    const element = document.createElement("cindor-kanban-board") as CindorKanbanBoard;
    element.columns = [
      ...columns,
      {
        id: "done",
        title: "Done",
        cards: [
          {
            id: "card-b",
            title: "Confirm release notes"
          }
        ]
      }
    ];
    document.body.append(element);
    await element.updateComplete;

    const surfaces = Array.from(element.renderRoot.querySelectorAll('[part="card-surface"]')) as HTMLElement[];
    surfaces.forEach((surface) => {
      surface.focus = vi.fn();
    });

    surfaces[0]?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "ArrowRight" }));
    expect(surfaces[1]?.focus).toHaveBeenCalledTimes(1);

    surfaces[1]?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "Home" }));
    expect(surfaces[0]?.focus).toHaveBeenCalledTimes(1);

    surfaces[0]?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "End" }));
    expect(surfaces[1]?.focus).toHaveBeenCalledTimes(2);
  });

  it("exposes selected state on interactive cards", async () => {
    const element = document.createElement("cindor-kanban-board") as CindorKanbanBoard;
    element.columns = columns;
    element.selectedCardId = "card-a";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[data-card-id="card-a"] [part="card-surface"]')?.getAttribute("aria-current")).toBe("true");
  });

  it("emits card-action without changing the current selection", async () => {
    const element = document.createElement("cindor-kanban-board") as CindorKanbanBoard;
    element.columns = columns;
    const actionListener = vi.fn();
    element.addEventListener("card-action", actionListener);
    document.body.append(element);
    await element.updateComplete;

    (element.renderRoot.querySelector('[data-card-id="card-a"] [part="action-button"]') as HTMLButtonElement).click();
    await element.updateComplete;

    expect(element.selectedCardId).toBe("");
    expect(actionListener.mock.calls.at(-1)?.[0].detail.actionKey).toBe("assign");
    expect(actionListener.mock.calls.at(-1)?.[0].detail.cardId).toBe("card-a");
  });

  it("moves a dragged card into an empty column and emits card-move details", async () => {
    const element = document.createElement("cindor-kanban-board") as CindorKanbanBoard;
    element.columns = columns.map((column) => ({ ...column, cards: [...column.cards] }));
    const moveListener = vi.fn();
    element.addEventListener("card-move", moveListener);
    document.body.append(element);
    await element.updateComplete;

    const card = element.renderRoot.querySelector('[data-card-id="card-a"]') as HTMLElement;
    const target = element.renderRoot.querySelector('[data-column-id="ready"] [part="column-cards"]') as HTMLElement;
    dispatchDragEvent(card, "dragstart");
    const dragOverEvent = dispatchDragEvent(target, "dragover");
    dispatchDragEvent(target, "drop");
    await element.updateComplete;

    expect(dragOverEvent.defaultPrevented).toBe(true);
    expect(element.columns[0]?.cards).toHaveLength(0);
    expect(element.columns[1]?.cards.map((entry) => entry.id)).toEqual(["card-a"]);
    expect(moveListener).toHaveBeenCalledTimes(1);
    expect(moveListener.mock.calls[0]?.[0].detail).toMatchObject({
      cardId: "card-a",
      fromColumnId: "triage",
      fromIndex: 0,
      toColumnId: "ready",
      toIndex: 0
    });
  });

  it("reorders cards when dropped on another card", async () => {
    const element = document.createElement("cindor-kanban-board") as CindorKanbanBoard;
    element.columns = [
      {
        id: "triage",
        title: "Triage",
        cards: [
          { id: "card-a", title: "First" },
          { id: "card-b", title: "Second" },
          { id: "card-c", title: "Third" }
        ]
      }
    ];
    document.body.append(element);
    await element.updateComplete;

    const first = element.renderRoot.querySelector('[data-card-id="card-a"]') as HTMLElement;
    const third = element.renderRoot.querySelector('[data-card-id="card-c"]') as HTMLElement;
    dispatchDragEvent(first, "dragstart");
    dispatchDragEvent(third, "dragover");
    dispatchDragEvent(third, "drop");
    await element.updateComplete;

    expect(element.columns[0]?.cards.map((entry) => entry.id)).toEqual(["card-b", "card-c", "card-a"]);
  });

  it("does not drag disabled cards or drop into a full column", async () => {
    const element = document.createElement("cindor-kanban-board") as CindorKanbanBoard;
    element.columns = [
      { id: "source", title: "Source", cards: [{ id: "disabled", title: "Disabled", disabled: true }, { id: "card-a", title: "Movable" }] },
      { id: "full", title: "Full", limit: 1, cards: [{ id: "card-b", title: "Existing" }] }
    ];
    const moveListener = vi.fn();
    element.addEventListener("card-move", moveListener);
    document.body.append(element);
    await element.updateComplete;

    const disabled = element.renderRoot.querySelector('[data-card-id="disabled"]') as HTMLElement;
    expect(disabled.draggable).toBe(false);
    dispatchDragEvent(disabled, "dragstart");

    const movable = element.renderRoot.querySelector('[data-card-id="card-a"]') as HTMLElement;
    const fullColumn = element.renderRoot.querySelector('[data-column-id="full"] [part="column-cards"]') as HTMLElement;
    dispatchDragEvent(movable, "dragstart");
    const dragOverEvent = dispatchDragEvent(fullColumn, "dragover");
    dispatchDragEvent(fullColumn, "drop");

    expect(dragOverEvent.defaultPrevented).toBe(false);
    expect(element.columns[0]?.cards.map((entry) => entry.id)).toEqual(["disabled", "card-a"]);
    expect(moveListener).not.toHaveBeenCalled();
  });
});
