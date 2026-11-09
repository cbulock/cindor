import type { LitElement } from "lit";

async function mount<T extends LitElement = LitElement>(tag: string, attributes = "", properties = {}): Promise<T> {
  const container = document.createElement("div");
  container.innerHTML = `<${tag} ${attributes}></${tag}>`;
  const host = container.firstElementChild as T;
  Object.assign(host, properties);
  document.body.append(container);
  await host.updateComplete;
  return host;
}

describe("native control events", () => {
  it.each([
    ["cindor-input", "input"], ["cindor-textarea", "textarea"], ["cindor-select", "select"],
    ["cindor-checkbox", "input"], ["cindor-radio", "input"], ["cindor-switch", "input"],
    ["cindor-range", "input"], ["cindor-color-input", "input"], ["cindor-file-input", "input"],
    ["cindor-segmented-control", "input", { options: [{ label: "Option", value: "option" }] }],
    ["cindor-rating-input", "input"], ["cindor-dropzone", "input"],
    ["cindor-markdown-editor", "textarea"]
  ] as const)("lets %s deliver one composed input event in both phases", async (tag, controlSelector, properties: object = {}) => {
    const host = await mount(tag, "", properties);
    const control = host.shadowRoot!.querySelector(controlSelector)!;
    const capture = vi.fn();
    const bubble = vi.fn();
    host.addEventListener("input", capture, true);
    host.addEventListener("input", bubble);
    const input = new InputEvent("input", { bubbles: true, composed: true, data: "a", inputType: "insertText" });
    control.dispatchEvent(input);
    expect(capture).toHaveBeenCalledTimes(1);
    expect(bubble).toHaveBeenCalledTimes(1);
    expect(capture.mock.calls[0][0]).toBe(input);
    expect(bubble.mock.calls[0][0]).toBe(input);
  });

  it.each([["cindor-input", "input"], ["cindor-textarea", "textarea"]])(
    "publishes %s value before non-capture input and change listeners run", async (tag, selector) => {
      const host = await mount<LitElement & { value: string }>(tag);
      const control = host.shadowRoot!.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
      const values: string[] = [];
      host.addEventListener("input", () => values.push(host.value));
      host.addEventListener("change", () => values.push(host.value));
      control.value = "updated";
      control.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
      control.dispatchEvent(new Event("change", { bubbles: true }));
      expect(values).toEqual(["updated", "updated"]);
    }
  );

  it("bridges a non-composed InputEvent with its editing data", async () => {
    const host = await mount("cindor-input");
    const listener = vi.fn();
    host.addEventListener("input", listener);
    host.shadowRoot!.querySelector("input")!.dispatchEvent(new InputEvent("input", {
      bubbles: true, data: "é", inputType: "insertCompositionText", isComposing: true
    }));
    expect(listener).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
      data: "é", inputType: "insertCompositionText", isComposing: true
    }));
    expect(listener.mock.calls[0][0]).toBeInstanceOf(InputEvent);
  });

  it.each([["cindor-input", "input"], ["cindor-textarea", "textarea"]])(
    "exposes %s selection and validation on the host", async (tag, selector) => {
      const host = await mount<LitElement & { checkValidity(): boolean }>(tag, "required");
      const select = vi.fn();
      const invalid = vi.fn();
      const ancestor = vi.fn();
      host.parentElement!.addEventListener("invalid", ancestor);
      host.addEventListener("select", select);
      host.addEventListener("invalid", invalid);
      host.shadowRoot!.querySelector(selector)!.dispatchEvent(new Event("select", { bubbles: true }));
      expect(host.checkValidity()).toBe(false);
      expect(select).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ target: host, bubbles: true }));
      expect(invalid).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ target: host, cancelable: true }));
      expect(ancestor).not.toHaveBeenCalled();
    }
  );
});

it("publishes a table search change while keeping search control events private", async () => {
  const host = await mount("cindor-data-table", "searchable", {
    columns: [{ key: "name", label: "Name" }], rows: [{ id: "1", name: "Cindor" }]
  });
  const search = host.shadowRoot!.querySelector<LitElement>("cindor-search")!;
  await search.updateComplete;
  const control = search.shadowRoot!.querySelector("input")!;
  const input = vi.fn();
  const change = vi.fn();
  const select = vi.fn();
  const searchChange = vi.fn();
  host.addEventListener("input", input);
  host.addEventListener("change", change);
  host.addEventListener("select", select);
  host.addEventListener("search-change", searchChange);
  control.value = "Cindor";
  control.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
  control.dispatchEvent(new Event("change", { bubbles: true }));
  control.dispatchEvent(new Event("select", { bubbles: true }));
  expect(searchChange).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ detail: { matchingRows: 1, searchQuery: "Cindor" } }));
  expect(input).not.toHaveBeenCalled();
  expect(change).not.toHaveBeenCalled();
  expect(select).not.toHaveBeenCalled();
});

describe("native lifecycle events", () => {
  it.each(["cindor-file-input", "cindor-dropzone"])("exposes %s file picker dismissal without changing the selection", async (tag) => {
    const host = await mount<LitElement & { files: FileList | null }>(tag);
    const control = host.shadowRoot!.querySelector("input[type=file]")!;
    const files = host.files;
    const cancel = vi.fn();
    const change = vi.fn();
    host.addEventListener("cancel", cancel);
    host.addEventListener("change", change);
    control.dispatchEvent(new Event("cancel", { bubbles: true }));
    expect(cancel).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ target: host, cancelable: false }));
    expect(change).not.toHaveBeenCalled();
    expect(host.files).toBe(files);
  });

  it("lets command palette consumers cancel dismissal at an ancestor", async () => {
    const host = await mount<LitElement & { open: boolean }>("cindor-command-palette", "open");
    const dialog = host.shadowRoot!.querySelector<LitElement & { open: boolean }>("cindor-dialog")!;
    await dialog.updateComplete;
    const native = dialog.shadowRoot!.querySelector("dialog")!;
    const cancel = vi.fn((event: Event) => event.preventDefault());
    host.parentElement!.addEventListener("cancel", cancel);
    expect(native.dispatchEvent(new Event("cancel", { cancelable: true }))).toBe(false);
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(host.open).toBe(true);
    expect(dialog.open).toBe(true);
  });

  it("keeps command palette search input and change separate from command selection", async () => {
    const host = await mount<LitElement & { query: string }>("cindor-command-palette");
    const search = host.shadowRoot!.querySelector<LitElement>("cindor-search")!;
    await search.updateComplete;
    const control = search.shadowRoot!.querySelector("input")!;
    const input = vi.fn();
    const change = vi.fn();
    const select = vi.fn();
    host.addEventListener("input", input);
    host.addEventListener("change", change);
    host.addEventListener("select", select);
    control.value = "find";
    control.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));
    control.dispatchEvent(new Event("select", { bubbles: true }));
    expect(host.query).toBe("find");
    expect(input).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
    expect(select).not.toHaveBeenCalled();
  });

  it("preserves the owned form's submitter and cancellation", async () => {
    const host = await mount("cindor-form");
    const form = host.querySelector("form")!;
    const submitter = document.createElement("button");
    form.append(submitter);
    const listener = vi.fn((event: Event) => event.preventDefault());
    host.addEventListener("submit", listener);
    const event = new SubmitEvent("submit", { bubbles: true, cancelable: true, submitter });
    expect(form.dispatchEvent(event)).toBe(false);
    expect(listener).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ submitter, target: form }));
    expect(listener.mock.calls[0][0]).toBeInstanceOf(SubmitEvent);
  });

  it("lets a host listener cancel an owned form reset", async () => {
    const host = await mount<LitElement & { reset(): void }>("cindor-form");
    const form = host.querySelector("form")!;
    const control = document.createElement("input");
    control.defaultValue = "initial";
    control.value = "edited";
    form.append(control);
    host.addEventListener("reset", (event) => event.preventDefault(), { once: true });
    host.reset();
    expect(control.value).toBe("edited");
    host.reset();
    expect(control.value).toBe("initial");
  });

  it("lets a host listener cancel dialog dismissal", async () => {
    const host = await mount<LitElement & { open: boolean }>("cindor-dialog", "open");
    const dialog = host.shadowRoot!.querySelector("dialog")!;
    host.addEventListener("cancel", (event) => event.preventDefault(), { once: true });
    expect(dialog.dispatchEvent(new Event("cancel", { cancelable: true }))).toBe(false);
    expect(host.open).toBe(true);
    expect(dialog.dispatchEvent(new Event("cancel", { cancelable: true }))).toBe(true);
    expect(host.open).toBe(false);
  });

  it("keeps an outer dialog open when its slotted dialog is dismissed", async () => {
    const outer = await mount<LitElement & { open: boolean }>("cindor-dialog", "open");
    const inner = document.createElement("cindor-dialog") as LitElement & { open: boolean };
    inner.open = true;
    outer.append(inner);
    await inner.updateComplete;
    const dialog = inner.shadowRoot!.querySelector("dialog")!;
    dialog.dispatchEvent(new Event("cancel", { cancelable: true }));
    dialog.dispatchEvent(new Event("close"));
    expect(inner.open).toBe(false);
    expect(outer.open).toBe(true);
  });
});
