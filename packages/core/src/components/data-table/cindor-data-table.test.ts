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

  it("keeps utility column headers accessible without visible header text", async () => {
    const element = await renderElement({
      columns: [
        { key: "name", label: "Name" },
        {
          key: "selected",
          label: "",
          headerDisplay: "none",
          headerLabel: "Select row",
          width: "4rem"
        }
      ],
      rows: [{ id: "row-1", name: "Jordan", selected: true }]
    });

    const headCells = Array.from(element.renderRoot.querySelectorAll("thead th"));
    const utilityHeader = headCells[1];

    expect(utilityHeader?.querySelector(".visually-hidden")?.textContent).toBe("Select row");
    expect(utilityHeader?.querySelector(".sort-button")).toBeNull();
  });

  it("uses headerLabel for sortable header controls", async () => {
    const element = await renderElement({
      columns: [
        {
          key: "priority",
          label: "Pri.",
          headerLabel: "Priority",
          sortable: true
        }
      ],
      rows: [
        { id: "row-1", priority: "High" },
        { id: "row-2", priority: "Low" }
      ]
    });

    const sortButton = element.renderRoot.querySelector('[part="sort-button"]') as HTMLButtonElement;

    expect(sortButton.getAttribute("aria-label")).toBe("Priority");
    expect(sortButton.textContent).toContain("Pri.");
  });

  it("expands rows with renderer content and emits row-expand", async () => {
    const element = await renderElement({
      expandableRows: true,
      rowExpansionRenderer: ({ row }) => `Details for ${String(row.name)}`
    });
    const handler = vi.fn();
    element.addEventListener("row-expand", handler);

    const button = element.renderRoot.querySelector('[part="row-toggle-button"]') as HTMLButtonElement;
    button.click();
    await element.updateComplete;

    const expansionRow = element.renderRoot.querySelector('[data-expansion-row="true"]');
    expect(expansionRow?.textContent).toContain("Details for Jordan");
    expect(element.expandedRowIds).toEqual(["jordan"]);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0].detail).toMatchObject({
      expanded: true,
      expandedRowIds: ["jordan"],
      rowId: "jordan"
    });
  });

  it("renders slot-backed expanded row content", async () => {
    const element = await renderElement({
      expandableRows: true
    });
    const details = document.createElement("div");
    details.slot = "row-expansion-jordan";
    details.textContent = "Jordan works the escalation queue.";
    element.append(details);
    await element.updateComplete;

    const button = element.renderRoot.querySelector('[part="row-toggle-button"]') as HTMLButtonElement;
    button.click();
    await element.updateComplete;

    expect(element.expandedRowIds).toEqual(["jordan"]);
    expect(element.renderRoot.querySelector('[data-expansion-row="true"]')).not.toBeNull();
    expect(element.querySelector('[slot="row-expansion-jordan"]')?.textContent).toContain("Jordan works the escalation queue.");
  });

  it("composes the shared search and pagination components", async () => {
    const element = await renderElement({
      searchable: true,
      pageSize: 2
    });

    expect(element.renderRoot.querySelector("cindor-search")).not.toBeNull();
    expect(element.renderRoot.querySelector("cindor-pagination")).not.toBeNull();
  });

  it("renders the pagination summary in the footer for searchable tables", async () => {
    const element = await renderElement({
      searchable: true,
      pageSize: 2,
      currentPage: 2
    });

    const toolbarSummary = element.renderRoot.querySelector('.toolbar [part="summary"]');
    const footerSummary = element.renderRoot.querySelector('.footer [part="summary"]');

    expect(toolbarSummary).toBeNull();
    expect(footerSummary?.textContent).toContain("Showing 3-4 of 4");
  });

  it("renders loading and empty states", async () => {
    const element = await renderElement({ loading: true, rows: [] });

    expect(element.renderRoot.querySelector("tbody")?.textContent).toContain("Loading rows...");

    element.loading = false;
    await element.updateComplete;

    expect(element.renderRoot.querySelector("tbody")?.textContent).toContain("No rows to display.");
  });

  it("shows an overflow hint when the table region scrolls horizontally", async () => {
    const resizeObserverController = installResizeObserverMock();
    const element = await renderElement({
      columns: [
        { key: "name", label: "Name", width: "16rem" },
        { key: "role", label: "Role", width: "16rem" },
        { key: "tickets", label: "Tickets", width: "16rem" }
      ],
      rows: rows.map((row) => ({ ...row, role: "Support" }))
    });
    const region = element.renderRoot.querySelector('[part="table-region"]') as HTMLElement | null;

    expect(region).not.toBeNull();
    if (!region) {
      resizeObserverController.restore();
      return;
    }

    Object.defineProperty(region, "clientWidth", { configurable: true, value: 320 });
    Object.defineProperty(region, "scrollWidth", { configurable: true, value: 720 });
    Object.defineProperty(region, "scrollLeft", { configurable: true, value: 0, writable: true });

    resizeObserverController.flush();
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="overflow-hint"]')?.textContent).toContain("Scroll horizontally");
    expect(region.getAttribute("data-overflow-end")).toBe("true");
    expect(region.getAttribute("data-overflow-start")).toBe("false");

    resizeObserverController.restore();
  });

  it("switches to a stacked mobile layout on phone-sized widths", async () => {
    const resizeObserverController = installResizeObserverMock();
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 600 });
    const element = await renderElement({
      columns: [
        { key: "name", label: "Name", priority: 1 },
        { key: "role", label: "Role", priority: 2 },
        { key: "tickets", label: "Tickets", numeric: true, priority: 3 }
      ],
      rows: rows.map((row) => ({ ...row, role: "Support" }))
    });
    window.dispatchEvent(new Event("resize"));
    await element.updateComplete;

    const region = element.renderRoot.querySelector('[part="table-region"]');
    const bodyCells = Array.from(element.renderRoot.querySelectorAll("tbody td"));
    expect(region?.getAttribute("data-mobile-layout")).toBe("true");
    expect(bodyCells).toHaveLength(12);
    expect(bodyCells[0]?.getAttribute("data-column-label")).toBe("Name");
    expect(bodyCells[1]?.getAttribute("data-column-label")).toBe("Role");
    expect(element.renderRoot.querySelector("tbody")?.textContent).toContain("Support");

    resizeObserverController.restore();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: originalInnerWidth });
  });

  it("uses header display settings for stacked mobile labels", async () => {
    const resizeObserverController = installResizeObserverMock();
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 600 });
    const element = await renderElement({
      columns: [
        { key: "name", label: "Name" },
        {
          key: "selected",
          label: "",
          headerDisplay: "none",
          headerLabel: "Select row"
        },
        {
          key: "status",
          label: "",
          headerDisplay: "sr-only",
          headerLabel: "Status"
        }
      ],
      rows: [{ id: "row-1", name: "Jordan", selected: true, status: "Open" }]
    });
    window.dispatchEvent(new Event("resize"));
    await element.updateComplete;

    const bodyCells = Array.from(element.renderRoot.querySelectorAll("tbody td"));

    expect(bodyCells[0]?.getAttribute("data-column-label")).toBe("Name");
    expect(bodyCells[1]?.hasAttribute("data-column-label")).toBe(false);
    expect(bodyCells[2]?.getAttribute("data-column-label")).toBe("Status");

    resizeObserverController.restore();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: originalInnerWidth });
  });

  it("hides lower-priority columns on tablet-sized widths", async () => {
    const resizeObserverController = installResizeObserverMock();
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 800 });
    const element = await renderElement({
      columns: [
        { key: "name", label: "Name", priority: 1 },
        { key: "role", label: "Role", priority: 2 },
        { key: "tickets", label: "Tickets", numeric: true, priority: 3 }
      ],
      rows: rows.map((row) => ({ ...row, role: "Support" }))
    });
    window.dispatchEvent(new Event("resize"));
    await element.updateComplete;

    const region = element.renderRoot.querySelector('[part="table-region"]');
    const headCells = Array.from(element.renderRoot.querySelectorAll("thead th"));
    expect(region?.getAttribute("data-mobile-layout")).toBe("false");
    expect(headCells).toHaveLength(2);
    expect(headCells[0]?.textContent).toContain("Name");
    expect(headCells[1]?.textContent).toContain("Role");
    expect(element.renderRoot.querySelector("tbody")?.textContent).not.toContain("12");

    resizeObserverController.restore();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: originalInnerWidth });
  });

  it("supports sticky leading columns and explicit minimum widths", async () => {
    const element = await renderElement({
      density: "compact",
      columns: [
        { key: "name", label: "Name", minWidth: "14rem", sticky: "start", width: "14rem" },
        { key: "tickets", label: "Tickets", numeric: true, minWidth: "10rem", width: "10rem" }
      ]
    });

    const headCells = Array.from(element.renderRoot.querySelectorAll("thead th"));

    expect(element.getAttribute("density")).toBe("compact");
    expect(headCells[0]?.getAttribute("data-sticky")).toBe("start");
    expect(headCells[0]?.getAttribute("part")).toContain("head-cell-sticky");
    expect(headCells[0]?.getAttribute("style")).toContain("min-width:14rem");
    expect(headCells[0]?.getAttribute("style")).toContain("--cindor-data-table-sticky-offset:0px");
  });
});

function installResizeObserverMock(): { flush: () => void; restore: () => void } {
  const callbacks = new Set<ResizeObserverCallback>();
  const originalResizeObserver = globalThis.ResizeObserver;

  class ResizeObserverMock {
    constructor(private readonly callback: ResizeObserverCallback) {
      callbacks.add(callback);
    }

    disconnect(): void {
      callbacks.delete(this.callback);
    }

    observe(): void {}

    unobserve(): void {}
  }

  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

  return {
    flush: () => {
      for (const callback of callbacks) {
        callback([], {} as ResizeObserver);
      }
    },
    restore: () => {
      globalThis.ResizeObserver = originalResizeObserver;
    }
  };
}
