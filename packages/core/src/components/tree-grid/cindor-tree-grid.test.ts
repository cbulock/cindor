import "../../register.js";

import type { DataTableColumn } from "../data-table/cindor-data-table.js";
import { CindorTreeGrid, type TreeGridRow } from "./cindor-tree-grid.js";

describe("cindor-tree-grid", () => {
  const columns: DataTableColumn[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "owner", label: "Owner", sortable: true }
  ];

  const rows: TreeGridRow[] = [
    {
      id: "platform",
      name: "Platform",
      owner: "Jordan",
      children: [
        { id: "platform-api", name: "API", owner: "Avery" },
        { id: "platform-auth", name: "Auth", owner: "Riley" }
      ]
    },
    {
      id: "workspace",
      name: "Workspace",
      owner: "Morgan",
      children: [{ id: "workspace-shell", name: "Shell", owner: "Taylor" }]
    }
  ];

  const renderElement = async (overrides: Partial<CindorTreeGrid> = {}) => {
    const element = document.createElement("cindor-tree-grid") as CindorTreeGrid;
    Object.assign(element, {
      columns,
      rows,
      ...overrides
    });
    document.body.append(element);
    await element.updateComplete;
    return element;
  };

  it("renders root rows by default", async () => {
    const element = await renderElement();
    const bodyRows = element.renderRoot.querySelector("cindor-data-table")?.shadowRoot?.querySelectorAll("tbody tr");

    expect(bodyRows).toHaveLength(2);
    expect(bodyRows?.[0]?.textContent).toContain("Platform");
    expect(bodyRows?.[1]?.textContent).toContain("Workspace");
  });

  it("renders expanded child rows inline with their parent", async () => {
    const element = await renderElement({ expandedRowIds: ["platform"] });
    const bodyRows = element.renderRoot.querySelector("cindor-data-table")?.shadowRoot?.querySelectorAll("tbody tr");

    expect(bodyRows).toHaveLength(4);
    expect(bodyRows?.[1]?.textContent).toContain("API");
    expect(bodyRows?.[2]?.textContent).toContain("Auth");
  });

  it("toggles branch rows and emits row-toggle", async () => {
    const element = await renderElement();
    const handler = vi.fn();
    element.addEventListener("row-toggle", handler);

    const button = element.renderRoot.querySelector("cindor-data-table")?.shadowRoot?.querySelector('[part="tree-toggle"]') as HTMLButtonElement;
    button.click();
    await element.updateComplete;

    expect(element.expandedRowIds).toEqual(["platform"]);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0].detail).toMatchObject({
      expanded: true,
      rowId: "platform"
    });
  });

  it("reports the visible row index for nested branch toggles", async () => {
    const nestedRows: TreeGridRow[] = [
      {
        id: "platform",
        name: "Platform",
        owner: "Jordan",
        children: [
          {
            id: "platform-api",
            name: "API",
            owner: "Avery",
            children: [{ id: "platform-api-auth", name: "Auth", owner: "Riley" }]
          }
        ]
      }
    ];

    const element = await renderElement({
      expandedRowIds: ["platform"],
      rows: nestedRows
    });
    const handler = vi.fn();
    element.addEventListener("row-toggle", handler);

    const buttons = element.renderRoot
      .querySelector("cindor-data-table")
      ?.shadowRoot?.querySelectorAll('[part="tree-toggle"]') as NodeListOf<HTMLButtonElement>;

    buttons[1]?.click();
    await element.updateComplete;

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0].detail).toMatchObject({
      rowId: "platform-api",
      rowIndex: 1
    });
  });

  it("keeps child rows grouped under parents when sorting roots", async () => {
    const element = await renderElement({
      expandedRowIds: ["workspace"],
      sortKey: "owner",
      sortDirection: "ascending"
    });

    const bodyRows = Array.from(
      element.renderRoot.querySelector("cindor-data-table")?.shadowRoot?.querySelectorAll("tbody tr") ?? []
    );

    expect(bodyRows[0]?.textContent).toContain("Platform");
    expect(bodyRows[1]?.textContent).toContain("Workspace");
    expect(bodyRows[2]?.textContent).toContain("Shell");
  });

  it("finds matching collapsed descendants through search", async () => {
    const element = await renderElement({
      searchable: true,
      searchQuery: "auth"
    });
    const bodyRows = Array.from(
      element.renderRoot.querySelector("cindor-data-table")?.shadowRoot?.querySelectorAll("tbody tr") ?? []
    );

    expect(bodyRows).toHaveLength(2);
    expect(bodyRows[0]?.textContent).toContain("Platform");
    expect(bodyRows[1]?.textContent).toContain("Auth");
  });
});
