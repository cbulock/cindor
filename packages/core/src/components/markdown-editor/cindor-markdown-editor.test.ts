import "../../register.js";

import { CindorMarkdownEditor } from "./cindor-markdown-editor.js";

type TestInternals = Pick<ElementInternals, "setFormValue" | "setValidity">;

describe("cindor-markdown-editor", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("syncs host value from the textarea input", async () => {
    const element = document.createElement("cindor-markdown-editor") as CindorMarkdownEditor;
    const onInput = vi.fn();
    element.addEventListener("input", onInput);
    document.body.append(element);
    await element.updateComplete;

    const textarea = element.renderRoot.querySelector("textarea") as HTMLTextAreaElement;
    textarea.value = "# Launch notes";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    await element.updateComplete;

    expect(element.value).toBe("# Launch notes");
    expect(onInput).toHaveBeenCalledTimes(1);
  });

  it("renders markdown preview for headings and emphasis", async () => {
    const element = document.createElement("cindor-markdown-editor") as CindorMarkdownEditor;
    element.mode = "preview";
    element.value = "# Launch\n\n**Ready** for rollout.";
    document.body.append(element);
    await element.updateComplete;

    const preview = element.renderRoot.querySelector('[part="preview"]') as HTMLElement;

    expect(preview.innerHTML).toContain("<h1>Launch</h1>");
    expect(preview.innerHTML).toContain("<strong>Ready</strong>");
  });

  it("escapes raw html before rendering preview", async () => {
    const element = document.createElement("cindor-markdown-editor") as CindorMarkdownEditor;
    element.mode = "preview";
    element.value = "<script>alert('xss')</script>";
    document.body.append(element);
    await element.updateComplete;

    const preview = element.renderRoot.querySelector('[part="preview"]') as HTMLElement;

    expect(preview.innerHTML).toContain("&lt;script&gt;alert");
    expect(preview.querySelector("script")).toBeNull();
  });

  it("applies toolbar formatting to the current selection", async () => {
    const element = document.createElement("cindor-markdown-editor") as CindorMarkdownEditor;
    element.value = "Launch";
    document.body.append(element);
    await element.updateComplete;

    const textarea = element.renderRoot.querySelector("textarea") as HTMLTextAreaElement;
    textarea.setSelectionRange(0, textarea.value.length);
    const boldButton = Array.from(element.renderRoot.querySelectorAll('[part="toolbar-button"]')).find((button) =>
      (button as HTMLButtonElement).title === "Bold"
    ) as HTMLButtonElement;

    boldButton.click();
    await element.updateComplete;

    expect(element.value).toBe("**Launch**");
  });

  it("switches between write, preview, and split modes", async () => {
    const element = document.createElement("cindor-markdown-editor") as CindorMarkdownEditor;
    document.body.append(element);
    await element.updateComplete;

    const modeButtons = Array.from(element.renderRoot.querySelectorAll('[part="mode-button"]')) as HTMLButtonElement[];

    modeButtons[1]?.click();
    await element.updateComplete;
    expect(element.mode).toBe("preview");
    expect(element.renderRoot.querySelector("textarea")).toBeNull();

    modeButtons[2]?.click();
    await element.updateComplete;
    expect(element.mode).toBe("split");
    expect(element.renderRoot.querySelector("textarea")).not.toBeNull();
    expect(element.renderRoot.querySelector('[part="preview"]')).not.toBeNull();
  });

  it("delegates focus and validity APIs and resets to its initial value", async () => {
    const element = document.createElement("cindor-markdown-editor") as CindorMarkdownEditor;
    const internals = {
      setFormValue: vi.fn(),
      setValidity: vi.fn()
    } satisfies TestInternals;
    (element as unknown as { internals?: TestInternals }).internals = internals;
    element.setAttribute("value", "seed");
    element.value = "seed";
    document.body.append(element);
    await element.updateComplete;

    const textarea = element.renderRoot.querySelector("textarea") as HTMLTextAreaElement;
    textarea.checkValidity = vi.fn(() => false);
    textarea.reportValidity = vi.fn(() => false);
    textarea.focus = vi.fn();

    expect(element.checkValidity()).toBe(false);
    expect(element.reportValidity()).toBe(false);
    element.focus();
    expect(textarea.focus).toHaveBeenCalledTimes(1);

    textarea.value = "updated";
    textarea.dispatchEvent(new Event("change", { bubbles: true }));
    await element.updateComplete;
    expect(element.value).toBe("updated");

    element.formDisabledCallback(true);
    await element.updateComplete;
    expect(internals.setFormValue).toHaveBeenLastCalledWith(null);

    element.formDisabledCallback(false);
    await element.updateComplete;
    element.formResetCallback();
    await element.updateComplete;
    expect(element.value).toBe("seed");
    expect(textarea.value).toBe("seed");
  });

  it("falls back to the preview surface when focus is requested outside write mode", async () => {
    const element = document.createElement("cindor-markdown-editor") as CindorMarkdownEditor;
    element.mode = "preview";
    element.value = "Preview only";
    document.body.append(element);
    await element.updateComplete;

    const preview = element.renderRoot.querySelector('[part="preview"]') as HTMLElement;
    expect(preview.getAttribute("tabindex")).toBe("-1");
    preview.focus = vi.fn();

    element.focus();

    expect(preview.focus).toHaveBeenCalledTimes(1);
  });
});
