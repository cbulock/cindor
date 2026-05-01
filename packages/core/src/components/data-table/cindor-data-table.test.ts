import "../../register.js";

import { CindorDataTable, type DataTableColumn, type DataTableRow } from "./cindor-data-table.js";

describe("cindor-data-table", () => {
  const columns: DataTableColumn[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "tickets", label: "Tickets", numeric: true, sortable: true }
  ];

  const rows: DataTableRow[] = [
    { id: "jordan", name: "Jordan", tickets: 8 },
    { id: "avery", name: "Avery", tickets: 3 },
    { id: "morgan", name: "Morgan", tickets: 5 },
    { id: "taylor", name: "Taylor", tickets: 1 }
  ];

  const renderElement = async (overrides: Partial<CindorDataTable> = {}) => {
    const element = document.createElement("cindor-data-table") as CindorDataTable;
    Object.assign(element, {
      columns,
      rows: rows.map((row) => ({ ...row })),
      ...overrides
    });
    document.body.append(element);
    await element.updateComplete;
    return element;
  };

  it("renders rows from column and row data", async () => {
    const element = await renderElement();
    const bodyRows = element.renderRoot.querySelectorAll("tbody tr");

    expect(bodyRows).toHaveLength(4);
    expect(bodyRows[0]?.textContent).toContain("Jordan");
  });

  it("toggles sortable columns and emits sort-change", async () => {
    const element = await renderElement();
    const handler = vi.fn();
    element.addEventListener("sort-change", handler);

    const sortButton = element.renderRoot.querySelector('[part="sort-button"]') as HTMLButtonElement;
    sortButton.click();
    await element.updateComplete;

    const firstSortedRow = element.renderRoot.querySelector("tbody tr");
    expect(firstSortedRow?.textContent).toContain("Avery");
    expect(handler).toHaveBeenCalledTimes(1);

    sortButton.click();
    await element.updateComplete;

    const firstDescendingRow = element.renderRoot.querySelector("tbody tr");
    expect(firstDescendingRow?.textContent).toContain("Taylor");
  });

  it("uses custom sort comparators", async () => {
    const element = await renderElement({
      columns: [
        {
          key: "name",
          label: "Name length",
          sortable: true,
          sortComparator: (left, right) =>
            String(left).length - String(right).length || String(left).localeCompare(String(right))
        }
      ]
    });

    const sortButton = element.renderRoot.querySelector('[part="sort-button"]') as HTMLButtonElement;
    sortButton.click();
    await element.updateComplete;

    const sortedRows = [...element.renderRoot.querySelectorAll("tbody tr")];
    expect(sortedRows[0]?.textContent).toContain("Avery");
    expect(sortedRows[3]?.textContent).toContain("Taylor");
  });

  it("filters rows with the built-in search control and emits search-change", async () => {
    const element = await renderElement({
      searchable: true,
      pageSize: 2,
      currentPage: 2
    });
    const handler = vi.fn();
    element.addEventListener("search-change", handler);

    const search = element.renderRoot.querySelector("cindor-search") as HTMLElement & { shadowRoot: ShadowRoot | null };
    const input = search.shadowRoot?.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = "tay";
    input.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
    await element.updateComplete;

    const bodyRows = element.renderRoot.querySelectorAll("tbody tr");
    expect(bodyRows).toHaveLength(1);
    expect(bodyRows[0]?.textContent).toContain("Taylor");
    expect(element.currentPage).toBe(1);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("paginates rows and emits page-change", async () => {
    const element = await renderElement({ pageSize: 2 });
    const handler = vi.fn();
    element.addEventListener("page-change", handler);

    const pagination = element.renderRoot.querySelector("cindor-pagination") as HTMLElement & { shadowRoot: ShadowRoot | null };
    const nextButton = pagination.shadowRoot?.querySelector('[aria-label="Next page"]') as HTMLButtonElement;
    nextButton.click();
    await element.updateComplete;

    const bodyRows = element.renderRoot.querySelectorAll("tbody tr");
    expect(element.currentPage).toBe(2);
    expect(bodyRows[0]?.textContent).toContain("Morgan");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("renders slot-backed cells using the row id key", async () => {
    const element = await renderElement({
      columns: [
        { key: "name", label: "Name" },
        { key: "tickets", label: "Priority", cellSlot: "priority-cell" }
      ]
    });
    const customCell = document.createElement("span");
    customCell.slot = "priority-cell-jordan";
    customCell.textContent = "Escalated";
    element.append(customCell);

    await element.updateComplete;

    const slot = element.renderRoot.querySelector('slot[name="priority-cell-jordan"]') as HTMLSlotElement;

    expect(slot.assignedElements()[0]?.textContent).toContain("Escalated");
  });

  it("renders tooltip-backed truncated cells", async () => {
    const element = await renderElement({
      columns: [
        { key: "name", label: "Name", width: "8rem", truncate: true, tooltip: true },
        { key: "tickets", label: "Tickets", numeric: true }
      ]
    });

    const tooltip = element.renderRoot.querySelector("cindor-tooltip");
    const content = element.renderRoot.querySelector('[part="cell-content"]') as HTMLElement;

    expect(tooltip).not.toBeNull();
    expect(content.dataset.truncate).toBe("true");
  });

  it("emits cell-edit when inline editors change row values", async () => {
    const element = await renderElement({
      columns: [
        { key: "name", label: "Name" },
        {
          key: "status",
          label: "Status",
          editor: {
            type: "select",
            options: [
              { label: "Open", value: "open" },
              { label: "Closed", value: "closed" }
            ]
          }
        }
      ],
      rows: [{ id: "row-1", name: "Jordan", status: "open" }]
    });
    const handler = vi.fn();
    element.addEventListener("cell-edit", handler);

    const editor = element.renderRoot.querySelector("cindor-select") as HTMLElement & { value: string };
    editor.value = "closed";
    editor.dispatchEvent(new Event("change"));
    await element.updateComplete;

    expect((element.rows[0] as Record<string, unknown>).status).toBe("closed");
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0].detail).toMatchObject({
      columnKey: "status",
      rowId: "row-1",
      value: "closed"
    });
  });

  it("emits row-action for action cells", async () => {
    const element = await renderElement({
      columns: [
        { key: "name", label: "Name" },
        {
          key: "actions",
          label: "Actions",
          actions: [{ key: "open", label: "Open ticket" }]
        }
      ]
    });
    const handler = vi.fn();
    element.addEventListener("row-action", handler);

    const button = element.renderRoot.querySelector("cindor-button") as HTMLElement;
    button.click();

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0].detail).toMatchObject({
      actionKey: "open",
      columnKey: "actions",
      rowId: "jordan"
    });
  });

  it("composes the shared search and pagination components", async () => {
    const element = await renderElement({
      searchable: true,
      pageSize: 2
    });

    expect(element.renderRoot.querySelector("cindor-search")).not.toBeNull();
    expect(element.renderRoot.querySelector("cindor-pagination")).not.toBeNull();
  });

  it("renders loading and empty states", async () => {
    const element = await renderElement({ loading: true, rows: [] });

    expect(element.renderRoot.querySelector("tbody")?.textContent).toContain("Loading rows...");

    element.loading = false;
    await element.updateComplete;

    expect(element.renderRoot.querySelector("tbody")?.textContent).toContain("No rows to display.");
  });
});
