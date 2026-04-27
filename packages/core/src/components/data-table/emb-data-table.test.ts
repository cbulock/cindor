import "../../register.js";

import { EmbDataTable, type DataTableColumn, type DataTableRow } from "./emb-data-table.js";

describe("emb-data-table", () => {
  const columns: DataTableColumn[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "tickets", label: "Tickets", numeric: true, sortable: true }
  ];

  const rows: DataTableRow[] = [
    { name: "Jordan", tickets: 8 },
    { name: "Avery", tickets: 3 },
    { name: "Morgan", tickets: 5 },
    { name: "Taylor", tickets: 1 }
  ];

  it("renders rows from column and row data", async () => {
    const element = document.createElement("emb-data-table") as EmbDataTable;
    element.columns = columns;
    element.rows = rows;
    document.body.append(element);
    await element.updateComplete;

    const bodyRows = element.renderRoot.querySelectorAll("tbody tr");

    expect(bodyRows).toHaveLength(4);
    expect(bodyRows[0]?.textContent).toContain("Jordan");
  });

  it("toggles sortable columns and emits sort-change", async () => {
    const element = document.createElement("emb-data-table") as EmbDataTable;
    element.columns = columns;
    element.rows = rows;
    document.body.append(element);
    await element.updateComplete;

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

  it("filters rows with the built-in search control and emits search-change", async () => {
    const element = document.createElement("emb-data-table") as EmbDataTable;
    element.columns = columns;
    element.rows = rows;
    element.searchable = true;
    element.pageSize = 2;
    element.currentPage = 2;
    document.body.append(element);
    await element.updateComplete;

    const handler = vi.fn();
    element.addEventListener("search-change", handler);

    const search = element.renderRoot.querySelector("emb-search") as HTMLElement & { shadowRoot: ShadowRoot | null };
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
    const element = document.createElement("emb-data-table") as EmbDataTable;
    element.columns = columns;
    element.rows = rows;
    element.pageSize = 2;
    document.body.append(element);
    await element.updateComplete;

    const handler = vi.fn();
    element.addEventListener("page-change", handler);

    const pagination = element.renderRoot.querySelector("emb-pagination") as HTMLElement & { shadowRoot: ShadowRoot | null };
    const nextButton = pagination.shadowRoot?.querySelector('[aria-label="Next page"]') as HTMLButtonElement;
    nextButton.click();
    await element.updateComplete;

    const bodyRows = element.renderRoot.querySelectorAll("tbody tr");

    expect(element.currentPage).toBe(2);
    expect(bodyRows[0]?.textContent).toContain("Morgan");
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("composes the shared search and pagination components", async () => {
    const element = document.createElement("emb-data-table") as EmbDataTable;
    element.columns = columns;
    element.rows = rows;
    element.searchable = true;
    element.pageSize = 2;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("emb-search")).not.toBeNull();
    expect(element.renderRoot.querySelector("emb-pagination")).not.toBeNull();
  });

  it("renders loading and empty states", async () => {
    const element = document.createElement("emb-data-table") as EmbDataTable;
    element.columns = columns;
    element.loading = true;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector("tbody")?.textContent).toContain("Loading rows...");

    element.loading = false;
    await element.updateComplete;

    expect(element.renderRoot.querySelector("tbody")?.textContent).toContain("No rows to display.");
  });
});
