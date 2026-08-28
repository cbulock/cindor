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

  it("reorders a card within the same column and emits move details", async () => {
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

    const cards = element.renderRoot.querySelectorAll<HTMLElement>('[data-card-id]');
    stubCardBounds(cards[0], { top: 0, height: 100 });
    stubCardBounds(cards[2], { top: 200, height: 100 });

    cards[0]?.dispatchEvent(createDragEvent("dragstart"));
    cards[2]?.dispatchEvent(createDragEvent("dragover", { clientY: 280 }));
    cards[2]?.dispatchEvent(createDragEvent("drop", { clientY: 280 }));
    await element.updateComplete;

    expect(element.columns[0]?.cards.map((card) => card.id)).toEqual(["card-b", "card-c", "card-a"]);
    expect(moveListener.mock.calls.at(-1)?.[0].detail).toMatchObject({
      cardId: "card-a",
      fromColumnId: "triage",
      fromIndex: 0,
      toColumnId: "triage",
      toIndex: 2
    });
  });

  it("moves a card across columns and allows dropping into an empty column", async () => {
    const element = document.createElement("cindor-kanban-board") as CindorKanbanBoard;
    element.columns = [
      {
        id: "triage",
        title: "Triage",
        cards: [
          { id: "card-a", title: "First" },
          { id: "card-b", title: "Second" }
        ]
      },
      {
        id: "ready",
        title: "Ready",
        cards: []
      }
    ];
    const moveListener = vi.fn();
    element.addEventListener("card-move", moveListener);
    document.body.append(element);
    await element.updateComplete;

    const sourceCard = element.renderRoot.querySelector<HTMLElement>('[data-card-id="card-b"]');
    const readyColumn = element.renderRoot.querySelector<HTMLElement>('[data-column-id="ready"] [part="column-cards"]');

    sourceCard?.dispatchEvent(createDragEvent("dragstart"));
    readyColumn?.dispatchEvent(createDragEvent("dragover"));
    readyColumn?.dispatchEvent(createDragEvent("drop"));
    await element.updateComplete;

    expect(element.columns[0]?.cards.map((card) => card.id)).toEqual(["card-a"]);
    expect(element.columns[1]?.cards.map((card) => card.id)).toEqual(["card-b"]);
    expect(moveListener.mock.calls.at(-1)?.[0].detail).toMatchObject({
      cardId: "card-b",
      fromColumnId: "triage",
      fromIndex: 1,
      toColumnId: "ready",
      toIndex: 0
    });
  });

  it("does not allow dragging disabled cards", async () => {
    const element = document.createElement("cindor-kanban-board") as CindorKanbanBoard;
    element.columns = [
      {
        id: "triage",
        title: "Triage",
        cards: [
          { id: "card-a", title: "First", disabled: true },
          { id: "card-b", title: "Second" }
        ]
      }
    ];
    const moveListener = vi.fn();
    element.addEventListener("card-move", moveListener);
    document.body.append(element);
    await element.updateComplete;

    const disabledCard = element.renderRoot.querySelector<HTMLElement>('[data-card-id="card-a"]');
    const enabledCard = element.renderRoot.querySelector<HTMLElement>('[data-card-id="card-b"]');
    stubCardBounds(disabledCard, { top: 0, height: 100 });
    stubCardBounds(enabledCard, { top: 100, height: 100 });

    disabledCard?.dispatchEvent(createDragEvent("dragstart"));
    enabledCard?.dispatchEvent(createDragEvent("dragover", { clientY: 180 }));
    enabledCard?.dispatchEvent(createDragEvent("drop", { clientY: 180 }));
    await element.updateComplete;

    expect(element.columns[0]?.cards.map((card) => card.id)).toEqual(["card-a", "card-b"]);
    expect(moveListener).not.toHaveBeenCalled();
  });

  it("keeps a card-level drop target when dragover bubbles through the column", async () => {
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

    const cards = element.renderRoot.querySelectorAll<HTMLElement>('[data-card-id]');
    stubCardBounds(cards[0], { top: 0, height: 100 });
    stubCardBounds(cards[1], { top: 100, height: 100 });

    cards[0]?.dispatchEvent(createDragEvent("dragstart"));
    cards[1]?.dispatchEvent(createDragEvent("dragover", { clientY: 110 }));
    await element.updateComplete;

    expect(cards[1]?.getAttribute("data-drop-before")).toBe("true");
    expect(cards[2]?.getAttribute("data-drop-after")).toBe("false");
  });
});

function stubCardBounds(element: HTMLElement | null | undefined, bounds: { height: number; top: number }): void {
  if (!element) {
    return;
  }

  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      bottom: bounds.top + bounds.height,
      height: bounds.height,
      left: 0,
      right: 0,
      top: bounds.top,
      width: 200,
      x: 0,
      y: bounds.top,
      toJSON: () => ({})
    })
  });
}

function createDragEvent(type: string, options: { clientY?: number } = {}): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "clientY", {
    configurable: true,
    value: options.clientY ?? 0
  });
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
