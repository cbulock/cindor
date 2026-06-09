import { afterEach } from "vitest";

import "../../register.js";

import { CindorDataGrid, type DataGridColumn, type DataGridRow } from "./cindor-data-grid.js";

describe("cindor-data-grid", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the empty state when rows are missing", async () => {
    const element = document.createElement("cindor-data-grid") as CindorDataGrid;
    element.emptyMessage = "No deployment rows.";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="empty"]')?.textContent).toContain("No deployment rows.");
  });

  it("emits active-cell-change when a cell is activated", async () => {
    const element = createGrid();
    const listener = vi.fn();
    element.addEventListener("active-cell-change", listener);
    document.body.append(element);
    await element.updateComplete;

    const button = element.renderRoot.querySelector<HTMLButtonElement>(".cell-button");
    button?.click();
    await element.updateComplete;

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]?.[0].detail).toMatchObject({
      rowId: "row-1",
      rowIndex: 0,
      columnIndex: 0
    });
  });

  it("edits input-backed cells and emits cell-edit", async () => {
    const element = createGrid();
    const listener = vi.fn();
    element.addEventListener("cell-edit", listener);
    document.body.append(element);
    await element.updateComplete;

    (element as unknown as { startEditing: (rowIndex: number, columnIndex: number) => void }).startEditing(0, 2);
    await element.updateComplete;

    const input = element.renderRoot.querySelector<HTMLElement>("cindor-input");
    Object.defineProperty(input, "value", { configurable: true, value: "Next week" });
    input?.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.rows[0]?.window).toBe("Next week");
    expect(listener.mock.calls[0]?.[0].detail).toMatchObject({
      columnKey: "window",
      rowId: "row-1",
      value: "Next week"
    });
  });

  it("edits switch-backed cells and emits cell-edit", async () => {
    const element = createGrid();
    const listener = vi.fn();
    element.addEventListener("cell-edit", listener);
    document.body.append(element);
    await element.updateComplete;

    (element as unknown as { startEditing: (rowIndex: number, columnIndex: number) => void }).startEditing(0, 3);
    await element.updateComplete;

    const toggle = element.renderRoot.querySelector<HTMLElement>("cindor-switch");
    Object.defineProperty(toggle, "checked", { configurable: true, value: false });
    toggle?.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;

    expect(element.rows[0]?.enabled).toBe(false);
    expect(listener.mock.calls[0]?.[0].detail).toMatchObject({
      columnKey: "enabled",
      rowId: "row-1",
      value: false
    });
  });
});

function createGrid(): CindorDataGrid {
  const element = document.createElement("cindor-data-grid") as CindorDataGrid;
  element.columns = createColumns();
  element.rows = createRows();
  return element;
}

function createColumns(): DataGridColumn[] {
  return [
    { key: "owner", label: "Owner", sticky: "start" },
    {
      key: "status",
      label: "Status",
      editor: {
        type: "select",
        options: [
          { label: "Healthy", value: "Healthy" },
          { label: "Needs review", value: "Needs review" }
        ]
      }
    },
    { key: "window", label: "Window", editor: { type: "input" } },
    { key: "enabled", label: "Enabled", editor: { type: "switch" } }
  ];
}

function createRows(): DataGridRow[] {
  return [
    { id: "row-1", owner: "Release Ops", status: "Healthy", window: "Today", enabled: true },
    { id: "row-2", owner: "Analytics", status: "Needs review", window: "Tomorrow", enabled: false }
  ];
}
