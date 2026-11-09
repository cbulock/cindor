import type { LitElement } from "lit";

async function mount(tag: string, properties = {}, children = ""): Promise<LitElement> {
  const host = document.createElement(tag) as LitElement;
  Object.assign(host, properties);
  host.innerHTML = children;
  document.body.append(host);
  await host.updateComplete;
  return host;
}

describe("composite value events", () => {
  it.each(["cindor-autocomplete", "cindor-combobox", "cindor-inline-edit"])(
    "preserves one native edit from %s",
    async (tag) => {
      const host = await mount(tag, { editing: true });
      const control = host.shadowRoot!.querySelector("input")!;
      const capture = vi.fn();
      const bubble = vi.fn();
      host.addEventListener("input", capture, true);
      host.addEventListener("input", bubble);

      const edit = new InputEvent("input", { bubbles: true, composed: true, data: "A" });
      control.value = "A";
      control.dispatchEvent(edit);

      expect(capture).toHaveBeenCalledTimes(1);
      expect(bubble).toHaveBeenCalledTimes(1);
      expect(capture.mock.calls[0][0]).toBe(edit);
      expect(bubble.mock.calls[0][0]).toBe(edit);
    }
  );

  it.each(["cindor-autocomplete", "cindor-combobox", "cindor-searchable-dropdown"])(
    "exposes cancelable validation from %s",
    async (tag) => {
      const host = await mount(tag, { required: true });
      const control = host.shadowRoot!.querySelector("input")!;
      const invalid = vi.fn((event: Event) => event.preventDefault());
      host.addEventListener("invalid", invalid);
      const result = control.dispatchEvent(new Event("invalid", { cancelable: true }));

      expect(result).toBe(false);
      expect(invalid).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ bubbles: false, target: host }));
    }
  );

  it.each(["cindor-autocomplete", "cindor-combobox"])(
    "exposes text selection from %s",
    async (tag) => {
      const host = await mount(tag);
      const control = host.shadowRoot!.querySelector("input")!;
      const select = vi.fn();
      host.addEventListener("select", select);

      control.dispatchEvent(new Event("select", { bubbles: true }));

      expect(select).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ target: host, bubbles: true }));
    }
  );

  it.each([
    ["cindor-date-picker", "2026-11-08"],
    ["cindor-date-time-picker", "2026-11-08T09:00"]
  ])("validates the required aggregate value of %s", async (tag, value) => {
    const host = await mount(tag, { required: true }) as LitElement & {
      checkValidity(): boolean;
      disabled: boolean;
      reportValidity(): boolean;
      value: string;
    };

    expect(host.checkValidity()).toBe(false);
    expect(host.reportValidity()).toBe(false);
    expect(host).toHaveProperty("validity.valueMissing", true);

    host.disabled = true;
    expect(host.checkValidity()).toBe(true);

    host.disabled = false;
    host.value = value;
    expect(host.checkValidity()).toBe(true);
  });

  it.each(["cindor-tag-input", "cindor-multi-select", "cindor-workspace-switcher", "cindor-transfer-list"])(
    "keeps private edits in %s from notifying value listeners",
    async (tag) => {
      const host = await mount(tag, { open: true });
      const control = host.shadowRoot!.querySelector("input, select")!;
      const input = vi.fn();
      host.addEventListener("input", input);

      control.dispatchEvent(new Event("input", { bubbles: true, composed: true }));

      expect(input).not.toHaveBeenCalled();
    }
  );

  it("reports one aggregate date and time edit", async () => {
    const host = await mount("cindor-date-time-picker", { value: "2026-11-08T09:00" });
    const time = host.shadowRoot!.querySelector<LitElement>("cindor-time-input")!;
    await time.updateComplete;
    const control = time.shadowRoot!.querySelector("input")!;
    const input = vi.fn();
    const change = vi.fn();
    host.addEventListener("input", input);
    host.addEventListener("change", change);

    control.value = "10:15";
    control.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));

    expect(host).toHaveProperty("value", "2026-11-08T10:15");
    expect(input).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledTimes(1);
  });

  it("publishes only the selected tab change from the mobile picker", async () => {
    const width = vi.spyOn(window, "innerWidth", "get").mockReturnValue(400);
    try {
      const host = await mount(
        "cindor-tabs",
        {},
        '<section data-value="one">One</section><section data-value="two">Two</section>'
      );
      await host.updateComplete;
      const picker = host.shadowRoot!.querySelector<LitElement>("cindor-select")!;
      await picker.updateComplete;
      const control = picker.shadowRoot!.querySelector("select")!;
      const input = vi.fn();
      const change = vi.fn();
      host.addEventListener("input", input);
      host.addEventListener("change", change);

      control.value = "two";
      control.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
      control.dispatchEvent(new Event("change", { bubbles: true }));

      expect(host).toHaveProperty("value", "two");
      expect(input).not.toHaveBeenCalled();
      expect(change).toHaveBeenCalledTimes(1);
    } finally {
      width.mockRestore();
    }
  });

  it("publishes only aggregate filter payloads for a value edit", async () => {
    const host = await mount("cindor-filter-builder", { fields: [{ label: "Owner", type: "text", value: "owner" }] });
    await host.updateComplete;
    const field = host.shadowRoot!.querySelector<LitElement>("cindor-input")!;
    await field.updateComplete;
    const control = field.shadowRoot!.querySelector("input")!;
    const input = vi.fn();
    const change = vi.fn();
    host.addEventListener("input", input);
    host.addEventListener("change", change);

    control.value = "Ada";
    control.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));

    const aggregate = expect.objectContaining({
      detail: expect.objectContaining({
        group: expect.objectContaining({ children: [expect.objectContaining({ field: "owner", value: "Ada" })] })
      })
    });
    expect(input).toHaveBeenCalledExactlyOnceWith(aggregate);
    expect(change).toHaveBeenCalledExactlyOnceWith(aggregate);
  });

  it("publishes a page-change from table pagination without exposing the child change", async () => {
    const host = await mount("cindor-data-table", {
      columns: [{ key: "owner", label: "Owner" }],
      pageSize: 1,
      rows: [{ id: "1", owner: "Ada" }, { id: "2", owner: "Cindor" }]
    });
    const pagination = host.shadowRoot!.querySelector<LitElement>("cindor-pagination")!;
    await pagination.updateComplete;
    const change = vi.fn();
    const pageChange = vi.fn();
    host.addEventListener("change", change);
    host.addEventListener("page-change", pageChange);

    pagination.shadowRoot!.querySelector<HTMLButtonElement>('[aria-label="Next page"]')!.click();

    expect(pageChange).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      detail: expect.objectContaining({ currentPage: 2 })
    }));
    expect(change).not.toHaveBeenCalled();
  });

  it.each(["cindor-data-table", "cindor-data-grid"])(
    "publishes cell-edit from %s without exposing editor value events",
    async (tag) => {
      const host = await mount(tag, {
        columns: [{ key: "owner", label: "Owner", editor: { type: "input" } }],
        rows: [{ id: "1", owner: "Cindor" }]
      });
      if (tag === "cindor-data-grid") {
        host.shadowRoot!.querySelector(".cell-button")!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        await host.updateComplete;
      }
      const editor = host.shadowRoot!.querySelector<LitElement>("cindor-input")!;
      await editor.updateComplete;
      const control = editor.shadowRoot!.querySelector("input")!;
      const input = vi.fn();
      const change = vi.fn();
      const cellEdit = vi.fn();
      host.addEventListener("input", input);
      host.addEventListener("change", change);
      host.addEventListener("cell-edit", cellEdit);

      control.value = "Ada";
      control.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
      control.dispatchEvent(new Event("change", { bubbles: true }));

      expect(cellEdit).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
        detail: expect.objectContaining({ columnKey: "owner", rowId: "1", value: "Ada" })
      }));
      expect(input).not.toHaveBeenCalled();
      expect(change).not.toHaveBeenCalled();
    }
  );
});
