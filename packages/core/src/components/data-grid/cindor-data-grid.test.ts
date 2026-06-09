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

  it("renders falsy values instead of dropping them", async () => {
    const element = document.createElement("cindor-data-grid") as CindorDataGrid;
    element.columns = [
      { key: "count", label: "Count" },
      { key: "enabled", label: "Enabled" }
    ];
    element.rows = [{ id: "row-1", count: 0, enabled: false }];
    document.body.append(element);
    await element.updateComplete;

    const buttons = [...element.renderRoot.querySelectorAll<HTMLButtonElement>(".cell-button")];
    const text = buttons.map((button) => button.textContent?.trim());

    expect(text).toContain("0");
    expect(text).toContain("false");
  });

  it("sorts rows and emits sort-change from sortable headers", async () => {
    const element = document.createElement("cindor-data-grid") as CindorDataGrid;
    element.columns = [
      { key: "owner", label: "Owner", sortable: true },
      { key: "status", label: "Status" }
    ];
    element.rows = [
      { id: "row-1", owner: "Release Ops", status: "Healthy" },
      { id: "row-2", owner: "Analytics", status: "Needs review" }
    ];
    const listener = vi.fn();
    element.addEventListener("sort-change", listener);
    document.body.append(element);
    await element.updateComplete;

    const sortButton = element.renderRoot.querySelector<HTMLButtonElement>(".sort-button");
    sortButton?.click();
    await element.updateComplete;

    let buttons = [...element.renderRoot.querySelectorAll<HTMLButtonElement>(".cell-button")];
    expect(buttons[0]?.textContent?.trim()).toBe("Analytics");
    expect(listener.mock.calls[0]?.[0].detail).toMatchObject({
      sortDirection: "ascending",
      sortKey: "owner"
    });

    sortButton?.click();
    await element.updateComplete;

    buttons = [...element.renderRoot.querySelectorAll<HTMLButtonElement>(".cell-button")];
    expect(buttons[0]?.textContent?.trim()).toBe("Release Ops");
    expect(listener.mock.calls[1]?.[0].detail).toMatchObject({
      sortDirection: "descending",
      sortKey: "owner"
    });
  });

  it("applies cumulative sticky offsets for multiple sticky columns", async () => {
    const element = document.createElement("cindor-data-grid") as CindorDataGrid;
    element.columns = [
      { key: "name", label: "Name", sticky: "start", width: "10rem" },
      { key: "team", label: "Team", sticky: "start", width: "8rem" },
      { key: "status", label: "Status" }
    ];
    element.rows = [{ id: "row-1", name: "Avery", team: "Ops", status: "Healthy" }];
    document.body.append(element);
    await element.updateComplete;

    const headerCells = [...element.renderRoot.querySelectorAll<HTMLTableCellElement>("thead th")];
    const bodyCells = [...element.renderRoot.querySelectorAll<HTMLTableCellElement>("tbody td")];

    expect(headerCells[0]?.getAttribute("style")).toContain("--cindor-data-grid-sticky-offset:0px;");
    expect(headerCells[1]?.getAttribute("style")).toContain("--cindor-data-grid-sticky-offset:calc(0px + 10rem);");
    expect(bodyCells[0]?.getAttribute("style")).toContain("--cindor-data-grid-sticky-offset:0px;");
    expect(bodyCells[1]?.getAttribute("style")).toContain("--cindor-data-grid-sticky-offset:calc(0px + 10rem);");
  });

  it("moves focus to the newly active cell during keyboard navigation", async () => {
    const element = createGrid();
    document.body.append(element);
    await element.updateComplete;

    const buttons = [...element.renderRoot.querySelectorAll<HTMLButtonElement>(".cell-button")];
    buttons[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await element.updateComplete;
    await Promise.resolve();

    const activeButton = element.renderRoot.querySelector<HTMLButtonElement>('.cell-button[data-active="true"][tabindex="0"]');
    expect(activeButton?.textContent?.trim()).toBe("Healthy");
    expect((element.renderRoot as ShadowRoot).activeElement).toBe(activeButton);
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
