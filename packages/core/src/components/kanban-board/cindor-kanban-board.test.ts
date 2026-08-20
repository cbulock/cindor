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
});
