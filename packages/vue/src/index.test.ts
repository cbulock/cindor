import { ref } from "vue";
import { CindorButton, CindorIconButton, CindorSplitButton } from "./index.js";
import { createApp, defineComponent, h, nextTick } from "vue";

import type { App } from "vue";

import { CindorOtpInput, CindorDiffViewer, CindorSearchableDropdown, CindorAutocomplete, CindorBanner, CindorDataTable, CindorEventCalendar, CindorMultiSelect, CindorTransferList } from "./index";

describe("cindor-ui-vue", () => {
  let container: HTMLDivElement | null = null;
  let app: App<Element> | null = null;

  afterEach(() => {
    app?.unmount();
    app = null;
    container?.remove();
    container = null;
  });

  it("passes controlled OTP values and emits all aggregate events", async () => {
    const input = vi.fn(), change = vi.fn(), complete = vi.fn(), update = vi.fn();
    const { ref } = await import("vue");
    const value = ref("012345");
    container = document.createElement("div"); document.body.append(container);
    app = createApp(defineComponent({ setup: () => () => h(CindorOtpInput, {
      modelValue: value.value, onInput: input, onChange: change, onComplete: complete, "onUpdate:modelValue": update
    }) }));
    app.mount(container);
    const element = await queryElement<HTMLElement & { value: string }>("cindor-otp-input");
    expect(element.value).toBe("012345"); expect(element.hasAttribute("value")).toBe(false);
    value.value = ""; await nextTick(); expect(element.value).toBe("");
    element.value = "123456";
    element.dispatchEvent(new Event("input")); element.dispatchEvent(new Event("change"));
    element.dispatchEvent(new CustomEvent("complete", { detail: { value: element.value } }));
    expect(input).toHaveBeenCalledTimes(1); expect(change).toHaveBeenCalledTimes(1); expect(complete).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith("123456");
  });

  it("passes and updates structured diff hunks as properties", async () => {
    const hunks = [{ oldStart: 1, newStart: 1, lines: [{ type: "addition" as const, text: "first" }] }];
    container = document.createElement("div");
    document.body.append(container);
    const { ref } = await import("vue");
    const state = ref(hunks);
    app = createApp(defineComponent({ setup: () => () => h(CindorDiffViewer, { hunks: state.value }) }));
    app.mount(container);
    const element = await queryElement<HTMLElement & { hunks: typeof hunks }>("cindor-diff-viewer");
    expect(element.hunks).toEqual(hunks);
    expect(element.hasAttribute("hunks")).toBe(false);
    state.value = [{ oldStart: 2, newStart: 2, lines: [] }];
    await nextTick();
    expect(element.hunks[0].newStart).toBe(2);
  });

  it("maps searchable dropdown model updates to committed host values", async () => {
    const onModelUpdate = vi.fn();
    mount((modelValue) => h(CindorSearchableDropdown, { modelValue, "onUpdate:modelValue": onModelUpdate }));
    const element = await queryElement<HTMLElement & { value: string }>("cindor-searchable-dropdown");
    element.value = "committed";
    element.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    await nextTick();
    expect(onModelUpdate).toHaveBeenCalledWith("committed");
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

  it("property-binds wrapper props to the element-facing custom element property names", async () => {
    const multiSelectValues = ["alpha", "beta"];
    const transferListValues = ["selected-1"];

    mountStatic(() =>
      h("div", [
        h(
          CindorMultiSelect,
          {
            modelValue: multiSelectValues
          },
          {
            default: () => [
              h("option", { value: "alpha", selected: true }, "Alpha"),
              h("option", { value: "beta", selected: true }, "Beta"),
              h("option", { value: "gamma" }, "Gamma")
            ]
          }
        ),
        h(
          CindorTransferList,
          {
            modelValue: transferListValues
          },
          {
            default: () => [
              h("option", { value: "selected-1", selected: true }, "Selected 1"),
              h("option", { value: "available-1" }, "Available 1")
            ]
          }
        )
      ])
    );

    const multiSelect = await queryElement<HTMLElement & { values: string[] }>("cindor-multi-select");
    const transferList = await queryElement<HTMLElement & { selectedValues: string[] }>("cindor-transfer-list");

    await nextTick();

    expect(multiSelect.values).toBe(multiSelectValues);
    expect(transferList.selectedValues).toBe(transferListValues);
  });

  it("property-binds event arrays and mirrors model updates from event calendar", async () => {
    const onModelUpdate = vi.fn();
    const events = [{ date: "2026-04-08", id: "release-freeze", title: "Release freeze" }];

    mount((modelValue) =>
      h(CindorEventCalendar, {
        events,
        modelValue,
        month: "2026-04",
        "onUpdate:modelValue": onModelUpdate
      })
    );

    const element = await queryElement<HTMLElement & { events: typeof events; value: string }>("cindor-event-calendar");
    expect(element.events).toBe(events);

    element.value = "2026-04-08";
    element.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    await nextTick();

    expect(onModelUpdate).toHaveBeenCalledWith("2026-04-08");
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

const buttonEvents = [
  ["onClick", "click"], ["onKeydown", "keydown"], ["onKeyup", "keyup"],
  ["onPointerdown", "pointerdown"], ["onPointerup", "pointerup"],
  ["onMousedown", "mousedown"], ["onMouseup", "mouseup"],
  ["onFocus", "focus"], ["onBlur", "blur"], ["onContextmenu", "contextmenu"]
] as const;

async function deepestButton(host: Element): Promise<HTMLButtonElement> {
  const element = host as Element & { updateComplete: Promise<unknown> };
  await Promise.resolve();
  await element.updateComplete;
  const inner = host.shadowRoot!.querySelector("cindor-button");
  if (inner) return deepestButton(inner);
  return host.shadowRoot!.querySelector("button")!;
}

describe.each([CindorButton, CindorIconButton, CindorSplitButton])("mounted button forwarding", (Component) => {
  it.each([
    ["aria-pressed", "mixed"], ["aria-busy", "true"], ["aria-disabled", "false"],
    ["aria-current", "page"], ["aria-keyshortcuts", "Alt+S"], ["aria-roledescription", "action"],
    ["aria-controls", "panel"], ["aria-expanded", "false"], ["aria-haspopup", "menu"]
  ])("preserves %s values and removal on the native control", async (attribute, initial) => {
    const container = document.createElement("div");
    document.body.append(container);
    const state = ref<Record<string, unknown>>({});
    const app = createApp(defineComponent({ setup: () => () => h(Component, state.value) }));
    app.mount(container);
    const render = async (props: Record<string, unknown>) => { state.value = props; await nextTick(); };
    const cleanup = () => app.unmount();
    try {
      for (const value of [initial, undefined, true, false, "mixed", null]) {
        await render({ [attribute]: value });
        const button = await deepestButton(container.firstElementChild!);
        expect(button.getAttribute(attribute)).toBe(value == null ? null : String(value));
      }
      const host = container.firstElementChild!;
      host.remove();
      host.setAttribute(attribute, initial);
      container.append(host);
      expect((await deepestButton(host)).getAttribute(attribute)).toBe(initial);
    } finally { cleanup(); container.remove(); }
  });

  it("preserves disabled activation and imperative focus/click", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const state = ref<Record<string, unknown>>({});
    const app = createApp(defineComponent({ setup: () => () => h(Component, state.value) }));
    app.mount(container);
    const render = async (props: Record<string, unknown>) => { state.value = props; await nextTick(); };
    const cleanup = () => app.unmount();
    const click = vi.fn();
    try {
      await render({ disabled: true, onClick: click });
      const host = container.firstElementChild as HTMLElement;
      const button = await deepestButton(host);
      host.click();
      expect(button.disabled).toBe(true);
      expect(click).not.toHaveBeenCalled();
      await render({ disabled: false, onClick: click });
      await deepestButton(host);
      await nextEventTask();
      host.focus();
      expect((button.getRootNode() as ShadowRoot).activeElement).toBe(button);
      host.click();
      expect(click).toHaveBeenCalledTimes(1);
    } finally { cleanup(); container.remove(); }
  });

  it.each(buttonEvents)("delivers %s once and updates/removes handlers", async (prop, type) => {
    const container = document.createElement("div");
    document.body.append(container);
    const state = ref<Record<string, unknown>>({});
    const app = createApp(defineComponent({ setup: () => () => h(Component, state.value) }));
    app.mount(container);
    const render = async (props: Record<string, unknown>) => { state.value = props; await nextTick(); };
    const cleanup = () => app.unmount();
    const first = vi.fn((event: Event) => event.preventDefault());
    const second = vi.fn();
    try {
      const capture = vi.fn();
      const outer = vi.fn();
      container.addEventListener(type, outer);
      await render({ [prop]: first, [prop + "Capture"]: capture });
      const button = await deepestButton(container.firstElementChild!);
      // Vue timestamps listeners to ignore events already in flight during an update.
      await nextEventTask();
      const options = { bubbles: true, composed: true, cancelable: true };
      const event = type.startsWith("key")
        ? new KeyboardEvent(type, { ...options, key: "Enter" })
        : type.startsWith("focus") || type === "blur"
          ? new FocusEvent(type, { ...options, relatedTarget: container })
          : new MouseEvent(type, { ...options, clientX: 17 });
      expect(button.dispatchEvent(event)).toBe(false);
      expect(first).toHaveBeenCalledTimes(1);
      expect(first).toHaveBeenCalledExactlyOnceWith(event);
      expect(capture).toHaveBeenCalledTimes(1);
      expect(outer).toHaveBeenCalledTimes(1);
      await render({ [prop]: second });
      await nextEventTask();
      button.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
      expect(first).toHaveBeenCalledTimes(1);
      expect(second).toHaveBeenCalledTimes(1);
      await render({});
      button.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
      expect(second).toHaveBeenCalledTimes(1);
    } finally { cleanup(); container.remove(); }
  });
});

it("keeps split menu toggle and update:open delivery intact", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const update = vi.fn(), toggle = vi.fn();
  const open = ref(false);
  const app = createApp(defineComponent({ setup: () => () => h(CindorSplitButton, {
    open: open.value,
    "aria-pressed": "mixed",
    onToggle: toggle,
    "onUpdate:open": (value: boolean) => { update(value); open.value = value; }
  }) }));
  app.mount(container);
  try {
    await nextTick();
    const host = container.firstElementChild!;
    await deepestButton(host);
    const triggerHost = host.shadowRoot!.querySelector(".menu-shell cindor-button")!;
    const trigger = await deepestButton(triggerHost);
    await nextEventTask();
    trigger.click();
    await nextTick();
    await deepestButton(host);
    expect(update).toHaveBeenCalledExactlyOnceWith(true);
    expect(toggle).toHaveBeenCalledTimes(1);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-label")).toBe("More actions");
    expect(trigger.hasAttribute("aria-pressed")).toBe(false);
  } finally { app.unmount(); container.remove(); }
});

async function nextEventTask(): Promise<void> {
  const attachedAt = Date.now();
  do {
    await new Promise((resolve) => setTimeout(resolve, 1));
  } while (Date.now() <= attachedAt);
}
