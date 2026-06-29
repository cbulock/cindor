import { css, html } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";
import { Marked } from "marked";

import { FormAssociatedElement } from "../shared/form-associated-element.js";

export type MarkdownEditorMode = "write" | "preview" | "split";

const marked = new Marked({
  breaks: true,
  gfm: true
});

type ToolbarAction = {
  apply: (editor: CindorMarkdownEditor) => void;
  label: string;
  title: string;
  value: string;
};

const toolbarActions: ToolbarAction[] = [
  {
    value: "heading",
    label: "H",
    title: "Heading",
    apply: (editor) => editor.prefixLines("# ")
  },
  {
    value: "bold",
    label: "B",
    title: "Bold",
    apply: (editor) => editor.wrapSelection("**", "**", "bold text")
  },
  {
    value: "italic",
    label: "I",
    title: "Italic",
    apply: (editor) => editor.wrapSelection("*", "*", "italic text")
  },
  {
    value: "link",
    label: "Link",
    title: "Insert link",
    apply: (editor) => editor.wrapSelection("[", "](https://example.com)", "link text")
  },
  {
    value: "quote",
    label: "Quote",
    title: "Block quote",
    apply: (editor) => editor.prefixLines("> ")
  },
  {
    value: "list",
    label: "List",
    title: "Bulleted list",
    apply: (editor) => editor.prefixLines("- ")
  },
  {
    value: "code",
    label: "</>",
    title: "Code block",
    apply: (editor) => editor.wrapSelection("```md\n", "\n```", "Add code or a snippet")
  }
];

/**
 * Markdown authoring surface with write, preview, and split modes.
 *
 * Use the built-in toolbar for lightweight formatting shortcuts and switch to preview mode to review rendered output.
 *
 * @summary Markdown editor with toolbar shortcuts and live preview.
 * @tag cindor-markdown-editor
 */
export class CindorMarkdownEditor extends FormAssociatedElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
    }

    .surface {
      display: grid;
      gap: var(--space-3);
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
      box-shadow: var(--shadow-sm);
    }

    .topbar {
      display: flex;
      gap: var(--space-3);
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .toolbar,
    .mode-switcher {
      display: inline-flex;
      gap: var(--space-2);
      align-items: center;
      flex-wrap: wrap;
    }

    .toolbar-label,
    .preview-empty {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }

    .toolbar-button,
    .mode-button {
      min-block-size: 2.25rem;
      padding: 0 var(--space-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg);
      color: var(--fg);
      font: inherit;
      cursor: pointer;
      transition:
        border-color var(--duration-base) var(--ease-out),
        background var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out);
    }

    .toolbar-button:hover:not(:disabled),
    .mode-button:hover:not(:disabled) {
      border-color: var(--border-strong);
      background: color-mix(in srgb, var(--bg-subtle) 72%, transparent);
    }

    .toolbar-button:focus-visible,
    .mode-button:focus-visible,
    textarea:focus-visible {
      outline: none;
      box-shadow: var(--ring-focus);
    }

    .mode-button[aria-pressed="true"] {
      border-color: color-mix(in srgb, var(--accent) 40%, var(--border-strong));
      background: color-mix(in srgb, var(--accent-muted) 22%, var(--surface));
      color: var(--accent);
    }

    .toolbar-button:disabled,
    .mode-button:disabled {
      cursor: not-allowed;
      color: var(--fg-subtle);
    }

    .workspace {
      display: grid;
      gap: var(--space-3);
    }

    .workspace[data-mode="split"] {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      align-items: start;
    }

    textarea,
    .preview {
      box-sizing: border-box;
      inline-size: 100%;
      min-block-size: 18rem;
      padding: var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--bg);
      color: var(--fg);
    }

    textarea {
      resize: vertical;
      font: inherit;
      font-family: var(--font-mono);
      line-height: var(--leading-code);
      letter-spacing: var(--tracking-code);
    }

    .preview {
      overflow: auto;
      line-height: var(--leading-relaxed);
    }

    .preview > :first-child {
      margin-top: 0;
    }

    .preview > :last-child {
      margin-bottom: 0;
    }

    .preview pre,
    .preview code {
      font-family: var(--font-mono);
    }

    .preview pre {
      overflow: auto;
      padding: var(--space-3);
      border-radius: var(--radius-md);
      background: var(--surface-inverse);
      color: var(--bg);
    }

    .preview code:not(pre code) {
      padding: 0 0.3em;
      border-radius: var(--radius-sm);
      background: color-mix(in srgb, var(--bg-subtle) 84%, transparent);
    }

    .preview blockquote {
      margin-inline: 0;
      padding-inline-start: var(--space-3);
      border-inline-start: 3px solid var(--border-strong);
      color: var(--fg-muted);
    }

    .preview a {
      color: var(--accent);
    }

    .preview img {
      max-inline-size: 100%;
      border-radius: var(--radius-md);
    }

    .sr-only {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @media (max-width: 900px) {
      .workspace[data-mode="split"] {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    mode: { reflect: true },
    name: { reflect: true },
    placeholder: { reflect: true },
    previewEmptyMessage: { reflect: true, attribute: "preview-empty-message" },
    previewLabel: { reflect: true, attribute: "preview-label" },
    readonly: { type: Boolean, reflect: true, attribute: "readonly" },
    required: { type: Boolean, reflect: true },
    rows: { type: Number, reflect: true },
    splitLabel: { reflect: true, attribute: "split-label" },
    toolbarLabel: { reflect: true, attribute: "toolbar-label" },
    value: { reflect: true },
    writeLabel: { reflect: true, attribute: "write-label" }
  };

  disabled = false;
  mode: MarkdownEditorMode = "write";
  name = "";
  placeholder = "Write in Markdown...";
  previewEmptyMessage = "Nothing to preview yet.";
  previewLabel = "Preview";
  readonly = false;
  required = false;
  rows = 14;
  splitLabel = "Split";
  toolbarLabel = "Formatting";
  value = "";
  writeLabel = "Write";

  private defaultValue = "";

  override connectedCallback(): void {
    super.connectedCallback();
    this.defaultValue = this.getAttribute("value") ?? this.value;
  }

  checkValidity(): boolean {
    return this.textareaElement?.checkValidity() ?? true;
  }

  override focus(options?: FocusOptions): void {
    const focusTarget = this.textareaElement ?? this.previewElement ?? this.surfaceElement;
    focusTarget?.focus(options);
  }

  reportValidity(): boolean {
    return this.textareaElement?.reportValidity() ?? true;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = this.defaultValue;
    this.syncFormState();
  }

  protected override render() {
    const showEditor = this.mode === "write" || this.mode === "split";
    const showPreview = this.mode === "preview" || this.mode === "split";

    return html`
      <section class="surface" part="surface">
        <div class="topbar" part="topbar">
          <div class="toolbar" part="toolbar" role="toolbar" aria-label=${this.toolbarLabel}>
            <span class="toolbar-label">${this.toolbarLabel}</span>
            ${toolbarActions.map(
              (action) => html`
                <button
                  class="toolbar-button"
                  part="toolbar-button"
                  type="button"
                  ?disabled=${this.disabled || this.readonly}
                  title=${action.title}
                  @click=${() => action.apply(this)}
                >
                  ${action.label}
                </button>
              `
            )}
          </div>

          <div class="mode-switcher" part="mode-switcher" aria-label="Editor mode">
            ${this.renderModeButton("write", this.writeLabel)}
            ${this.renderModeButton("preview", this.previewLabel)}
            ${this.renderModeButton("split", this.splitLabel)}
          </div>
        </div>

        <div class="workspace" part="workspace" data-mode=${this.mode}>
          ${showEditor
            ? html`
                <label class="sr-only" for=${this.controlId}>Markdown editor</label>
                <textarea
                  id=${this.controlId}
                  part="editor"
                  .value=${live(this.value)}
                  ?disabled=${this.disabled}
                  form=${ifDefined(this.associatedFormId)}
                  name=${this.name}
                  placeholder=${this.placeholder}
                  ?readonly=${this.readonly}
                  ?required=${this.required}
                  rows=${this.rows}
                  @input=${this.handleInput}
                  @change=${this.handleChange}
                ></textarea>
              `
            : null}

          ${showPreview
            ? html`
                <section class="preview" part="preview" aria-label=${this.previewLabel}>
                  tabindex="-1"
                  ${this.value.trim()
                    ? unsafeHTML(this.previewHtml)
                    : html`<p class="preview-empty">${this.previewEmptyMessage}</p>`}
                </section>
              `
            : null}
        </div>
      </section>
    `;
  }

  protected override updated(): void {
    this.syncFormState();
    this.syncControlA11y(this.textareaElement);
  }

  wrapSelection(prefix: string, suffix: string, fallbackText: string): void {
    const textarea = this.textareaElement;
    if (!textarea || this.disabled || this.readonly) {
      return;
    }

    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const selection = textarea.value.slice(start, end) || fallbackText;
    textarea.setRangeText(`${prefix}${selection}${suffix}`, start, end, "select");
    this.commitTextareaValue(textarea, "input");
  }

  prefixLines(prefix: string): void {
    const textarea = this.textareaElement;
    if (!textarea || this.disabled || this.readonly) {
      return;
    }

    const value = textarea.value;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? value.length;
    const blockStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const blockEndIndex = value.indexOf("\n", end);
    const blockEnd = blockEndIndex === -1 ? value.length : blockEndIndex;
    const selectedBlock = value.slice(blockStart, blockEnd);
    const prefixedBlock = selectedBlock
      .split("\n")
      .map((line) => `${prefix}${line}`)
      .join("\n");

    textarea.setRangeText(prefixedBlock, blockStart, blockEnd, "select");
    this.commitTextareaValue(textarea, "input");
  }

  private renderModeButton(mode: MarkdownEditorMode, label: string) {
    return html`
      <button
        class="mode-button"
        part="mode-button"
        type="button"
        ?disabled=${this.disabled}
        aria-pressed=${String(this.mode === mode)}
        @click=${() => {
          this.mode = mode;
        }}
      >
        ${label}
      </button>
    `;
  }

  private handleChange = (event: Event): void => {
    event.stopPropagation();
    this.commitTextareaValue(event.currentTarget as HTMLTextAreaElement, "change");
  };

  private handleInput = (event: InputEvent): void => {
    event.stopPropagation();
    this.commitTextareaValue(event.currentTarget as HTMLTextAreaElement, "input");
  };

  private commitTextareaValue(textarea: HTMLTextAreaElement, eventName: "change" | "input"): void {
    this.value = textarea.value;
    this.syncFormState();
    textarea.focus();
    this.dispatchEvent(new Event(eventName, { bubbles: true, composed: true }));
  }

  private syncFormState(): void {
    if (this.disabled) {
      this.setFormValue(null);
      return;
    }

    this.setFormValue(this.value);
    if (this.textareaElement) {
      this.setValidityFrom(this.textareaElement);
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  private get previewHtml(): string {
    return marked.parse(this.escapeHtml(this.value)) as string;
  }

  private get previewElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".preview");
  }

  private get surfaceElement(): HTMLElement | null {
    return this.renderRoot.querySelector(".surface");
  }

  private get textareaElement(): HTMLTextAreaElement | null {
    return this.renderRoot.querySelector("textarea");
  }
}
