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

  it("reorders cards with drag and drop and emits card-move detail", async () => {
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
    const moveListener = vi.fn();
    element.addEventListener("card-move", moveListener);
    document.body.append(element);
    await element.updateComplete;

    const cards = element.renderRoot.querySelectorAll<HTMLElement>('[part="card"]');
    cards[0]?.dispatchEvent(createDragEvent("dragstart"));
    cards[2]?.dispatchEvent(createDragEvent("dragover"));
    cards[2]?.dispatchEvent(createDragEvent("drop"));
    await element.updateComplete;

    expect(element.columns[0]?.cards.map((card) => card.id)).toEqual(["card-b", "card-c", "card-a"]);
    expect(moveListener.mock.calls[0]?.[0].detail).toMatchObject({
      cardId: "card-a",
      fromColumnId: "triage",
      fromIndex: 0,
      reason: "drag",
      toColumnId: "triage",
      toIndex: 2
    });
  });

  it("drops a card into an empty column", async () => {
    const element = document.createElement("cindor-kanban-board") as CindorKanbanBoard;
    element.columns = columns;
    document.body.append(element);
    await element.updateComplete;

    element.renderRoot.querySelector<HTMLElement>('[data-card-id="card-a"]')?.dispatchEvent(createDragEvent("dragstart"));
    element.renderRoot.querySelector<HTMLElement>('[data-column-id="ready"] [part="column-cards"]')?.dispatchEvent(createDragEvent("dragover"));
    element.renderRoot.querySelector<HTMLElement>('[data-column-id="ready"] [part="column-cards"]')?.dispatchEvent(createDragEvent("drop"));
    await element.updateComplete;

    expect(element.columns[0]?.cards).toHaveLength(0);
    expect(element.columns[1]?.cards.map((card) => card.id)).toEqual(["card-a"]);
  });

  it("moves cards with control plus arrow keys as an accessible drag alternative", async () => {
    const element = document.createElement("cindor-kanban-board") as CindorKanbanBoard;
    element.columns = [
      { id: "todo", title: "Todo", cards: [{ id: "card-a", title: "First" }, { id: "card-b", title: "Second" }] },
      { id: "done", title: "Done", cards: [] }
    ];
    const moveListener = vi.fn();
    element.addEventListener("card-move", moveListener);
    document.body.append(element);
    await element.updateComplete;

    const surface = element.renderRoot.querySelector<HTMLElement>('[data-card-id="card-a"] [part="card-surface"]');
    surface?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ctrlKey: true, key: "ArrowDown" }));
    await element.updateComplete;
    expect(element.columns[0]?.cards.map((card) => card.id)).toEqual(["card-b", "card-a"]);

    element.renderRoot
      .querySelector<HTMLElement>('[data-card-id="card-a"] [part="card-surface"]')
      ?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ctrlKey: true, key: "ArrowRight" }));
    await element.updateComplete;

    expect(element.columns[0]?.cards.map((card) => card.id)).toEqual(["card-b"]);
    expect(element.columns[1]?.cards.map((card) => card.id)).toEqual(["card-a"]);
    expect(moveListener.mock.calls.at(-1)?.[0].detail).toMatchObject({ reason: "keyboard", toColumnId: "done" });
  });

  it("does not make disabled cards draggable", async () => {
    const element = document.createElement("cindor-kanban-board") as CindorKanbanBoard;
    element.columns = [{ id: "todo", title: "Todo", cards: [{ id: "blocked", title: "Blocked", disabled: true }] }];
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector<HTMLElement>('[data-card-id="blocked"]')?.draggable).toBe(false);
  });
});

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
