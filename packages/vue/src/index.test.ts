import { createApp, defineComponent, h, nextTick } from "vue";

import type { App } from "vue";

import { CindorAutocomplete, CindorBanner, CindorDataTable } from "./index";

describe("cindor-ui-vue", () => {
  let container: HTMLDivElement | null = null;
  let app: App<Element> | null = null;

  afterEach(() => {
    app?.unmount();
    app = null;
    container?.remove();
    container = null;
  });

  it("preserves structured props and emits update:modelValue from autocomplete", async () => {
    const onModelUpdate = vi.fn();
    const suggestions = [{ label: "Alpha" }, { label: "Beta" }];

    mount((modelValue) =>
      h(CindorAutocomplete, {
        modelValue,
        suggestions,
        "onUpdate:modelValue": onModelUpdate
      })
    );

    const element = await queryElement<HTMLElement & { suggestions: typeof suggestions; value: string }>("cindor-autocomplete");
    expect(element.suggestions).toEqual(suggestions);

    element.value = "Beta";
    element.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    await nextTick();

    expect(onModelUpdate).toHaveBeenCalledWith("Beta");
  });

  it("emits update:open from banner open-change events", async () => {
    const onOpenUpdate = vi.fn();

    mount((modelValue) =>
      h(CindorBanner, {
        open: modelValue !== "closed",
        "onUpdate:open": onOpenUpdate
      })
    );

    const element = await queryElement<HTMLElement>("cindor-banner");
    element.dispatchEvent(new CustomEvent("open-change", { bubbles: true, composed: true, detail: { open: false } }));
    await nextTick();

    expect(onOpenUpdate).toHaveBeenCalledWith(false);
  });

  it("property-binds data table props and renders rows with slot-backed cells in Vue", async () => {
    const columns = [
      { key: "name", label: "Name", sortable: true },
      { key: "status", label: "Status", cellSlot: "status-cell" }
    ];
    const rows = [
      { uuid: "row-1", name: "Jordan", status: "Open" },
      { uuid: "row-2", name: "Avery", status: "Closed" }
    ];

    mountStatic(() =>
      h(
        CindorDataTable,
        {
          columns,
          currentPage: 1,
          expandableRows: true,
          expandedRowIds: ["row-1"],
          pageSize: 0,
          rowIdKey: "uuid",
          rows,
          sortDirection: "ascending",
          sortKey: "name"
        },
        {
          "status-cell-row-1": () => h("span", { class: "status-chip" }, "Open"),
          "status-cell-row-2": () => h("span", { class: "status-chip" }, "Closed"),
          "row-expansion-row-1": () => h("div", { class: "expansion-copy" }, "Jordan handles escalations.")
        }
      )
    );

    const element = await queryElement<
      HTMLElement & {
        columns: typeof columns;
        currentPage: number;
        expandedRowIds: string[];
        rowIdKey: string;
        rows: typeof rows;
        sortDirection: string;
        sortKey: string;
        updateComplete?: Promise<unknown>;
      }
    >("cindor-data-table");

    await element.updateComplete;
    await nextTick();

    expect(element.columns).toBe(columns);
    expect(element.rows).toBe(rows);
    expect(element.expandedRowIds).toEqual(["row-1"]);
    expect(element.currentPage).toBe(1);
    expect(element.rowIdKey).toBe("uuid");
    expect(element.sortKey).toBe("name");
    expect(element.sortDirection).toBe("ascending");

    const renderedRows = element.shadowRoot?.querySelectorAll("tbody tr[data-row-id]") ?? [];
    const statusSlot = element.shadowRoot?.querySelector('slot[name="status-cell-row-1"]');
    const expansionRow = element.shadowRoot?.querySelector("#row-expansion-row-1");
    const expansionSlot = element.shadowRoot?.querySelector('slot[name="row-expansion-row-1"]');

    expect(renderedRows).toHaveLength(2);
    expect(renderedRows[0]?.getAttribute("data-row-id")).toBe("row-2");
    expect(renderedRows[1]?.getAttribute("data-row-id")).toBe("row-1");
    expect(statusSlot).not.toBeNull();
    expect(expansionRow).not.toBeNull();
    expect(expansionSlot).not.toBeNull();
  });

  function mount(renderWrapper: (modelValue: string) => ReturnType<typeof h>) {
    container = document.createElement("div");
    document.body.append(container);

    app = createApp(
      defineComponent({
        data: () => ({
          modelValue: ""
        }),
        render() {
          return renderWrapper(this.modelValue);
        }
      })
    );

    app.mount(container);
  }

  function mountStatic(renderWrapper: () => ReturnType<typeof h>) {
    container = document.createElement("div");
    document.body.append(container);

    app = createApp(
      defineComponent({
        render() {
          return renderWrapper();
        }
      })
    );

    app.mount(container);
  }
});

async function queryElement<T extends Element>(selector: string): Promise<T> {
  await nextTick();
  const element = document.body.querySelector(selector);

  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }

  return element as T;
}
