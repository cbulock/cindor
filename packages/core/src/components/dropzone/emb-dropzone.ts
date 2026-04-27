import { css, html } from "lit";

import { FormAssociatedElement } from "../shared/form-associated-element.js";

export class EmbDropzone extends FormAssociatedElement {
  static styles = css`
    :host {
      display: inline-grid;
      gap: var(--space-2);
      width: var(--emb-field-inline-size, min(100%, 520px));
      max-width: 100%;
      min-width: 0;
      color: var(--fg);
    }

    input {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      padding: 0;
      border: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .surface {
      display: grid;
      gap: var(--space-4);
      padding: var(--space-5);
      border: 1px dashed var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
      transition:
        border-color var(--duration-base) var(--ease-out),
        background var(--duration-base) var(--ease-out),
        box-shadow var(--duration-base) var(--ease-out);
    }

    .surface[data-active="true"] {
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent-muted) 65%, var(--surface));
      box-shadow: var(--ring-focus);
    }

    .surface:focus-within {
      box-shadow: var(--ring-focus);
    }

    .surface[data-disabled="true"] {
      border-color: var(--border);
      background: var(--bg-subtle);
    }

    .hero {
      display: grid;
      justify-items: center;
      gap: var(--space-3);
      text-align: center;
    }

    emb-icon {
      color: var(--accent);
    }

    .title {
      font-size: var(--text-base);
      font-weight: 600;
    }

    .description {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }

    .actions {
      display: flex;
      justify-content: center;
    }

    .summary {
      display: grid;
      gap: var(--space-2);
    }

    .summary-label {
      font-size: var(--text-sm);
      font-weight: 600;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .empty {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }

    :host([disabled]) .title,
    :host([disabled]) .description,
    :host([disabled]) .summary-label,
    :host([disabled]) .empty {
      color: var(--fg-subtle);
    }

    :host([disabled]) emb-icon {
      color: var(--fg-subtle);
    }
  `;

  static properties = {
    accept: { reflect: true },
    disabled: { type: Boolean, reflect: true },
    dragActive: { state: true },
    multiple: { type: Boolean, reflect: true },
    name: { reflect: true },
    required: { type: Boolean, reflect: true }
  };

  accept = "";
  disabled = false;
  multiple = false;
  name = "";
  required = false;

  private dragActive = false;
  private selectedFiles: File[] = [];
  private selectedFilesList: FileList | null = null;

  checkValidity(): boolean {
    this.syncFormState();
    return !(this.internals?.validity.valid === false);
  }

  get files(): FileList | null {
    return this.selectedFilesList ?? this.inputElement?.files ?? null;
  }

  override focus(options?: FocusOptions): void {
    this.triggerElement?.focus(options);
  }

  reportValidity(): boolean {
    this.syncFormState();
    return this.internals?.reportValidity?.() ?? true;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.selectedFiles = [];
    this.selectedFilesList = null;
    if (this.inputElement) {
      this.inputElement.value = "";
    }
    this.syncFormState();
  }

  protected override render() {
    const triggerLabel = this.multiple ? "Browse files" : "Browse file";
    const title = this.multiple ? "Drop files here" : "Drop a file here";
    const description = this.accept ? `Accepted types: ${this.accept}` : "Drag and drop or browse from your device";

    return html`
      <div
        class="surface"
        part="surface"
        data-active=${String(this.dragActive)}
        data-disabled=${String(this.disabled)}
        @dragenter=${this.handleDragEnter}
        @dragover=${this.handleDragOver}
        @dragleave=${this.handleDragLeave}
        @drop=${this.handleDrop}
      >
        <input
          part="control"
          accept=${this.accept}
          ?disabled=${this.disabled}
          ?multiple=${this.multiple}
          name=${this.name}
          ?required=${this.required}
          type="file"
          @input=${this.handleInput}
          @change=${this.handleChange}
        />
        <div class="hero">
          <emb-icon name="upload" part="icon" size="24"></emb-icon>
          <div class="title" part="title">${title}</div>
          <div class="description" part="description">${description}</div>
        </div>
        <div class="actions">
          <emb-button part="trigger" type="button" variant="ghost" ?disabled=${this.disabled} @click=${this.handleTriggerClick}>
            <emb-icon slot="start-icon" name="folder-open" part="trigger-icon" size="16"></emb-icon>
            ${triggerLabel}
          </emb-button>
        </div>
        <div class="summary" part="summary">
          <div class="summary-label" part="summary-label">${this.multiple ? "Selected files" : "Selected file"}</div>
          ${this.selectedFiles.length > 0
            ? html`
                <div class="chips" part="chips">
                  ${this.selectedFiles.map(
                    (file) => html`
                      <emb-chip part="file-chip">${file.name}</emb-chip>
                    `
                  )}
                </div>
              `
            : html`<div class="empty" part="empty">No files selected</div>`}
        </div>
      </div>
    `;
  }

  protected override updated(): void {
    this.syncControlA11y(this.triggerElement);
    this.syncFormState();
  }

  private handleInput = (event: InputEvent): void => {
    event.stopPropagation();
    this.captureInputFiles();
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  };

  private handleChange = (event: Event): void => {
    event.stopPropagation();
    this.captureInputFiles();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private handleTriggerClick = (): void => {
    if (this.disabled) {
      return;
    }

    this.inputElement?.click();
  };

  private handleDragEnter = (event: DragEvent): void => {
    if (this.disabled) {
      return;
    }

    event.preventDefault();
    this.dragActive = true;
  };

  private handleDragOver = (event: DragEvent): void => {
    if (this.disabled) {
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
    this.dragActive = true;
  };

  private handleDragLeave = (event: DragEvent): void => {
    if (this.disabled) {
      return;
    }

    const currentTarget = event.currentTarget as HTMLElement | null;
    const nextTarget = event.relatedTarget as Node | null;
    if (currentTarget?.contains(nextTarget)) {
      return;
    }

    this.dragActive = false;
  };

  private handleDrop = (event: DragEvent): void => {
    if (this.disabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.dragActive = false;

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) {
      this.captureFiles([], null);
      return;
    }

    const droppedFiles = this.multiple ? Array.from(files) : [files[0]].filter((file): file is File => file instanceof File);
    this.captureFiles(droppedFiles, files);
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  };

  private captureInputFiles(): void {
    const files = this.inputElement?.files;
    const selectedFiles = files ? Array.from(files) : [];
    this.captureFiles(selectedFiles, files ?? null);
  }

  private captureFiles(files: File[], fileList: FileList | null): void {
    this.selectedFiles = this.multiple ? files : files.slice(0, 1);
    this.selectedFilesList = fileList;
    this.syncInputFiles(fileList);
    this.syncFormState();
    this.requestUpdate();
  }

  private syncFormState(): void {
    if (this.disabled) {
      this.setFormValue(null);
      this.internals?.setValidity?.({});
      return;
    }

    if (this.selectedFiles.length === 0) {
      this.setFormValue(null);
      if (this.required) {
        this.internals?.setValidity?.({ valueMissing: true }, "Please select at least one file.", this.triggerElement ?? undefined);
      } else {
        this.internals?.setValidity?.({});
      }
      return;
    }

    if (this.multiple) {
      const formData = new FormData();
      for (const file of this.selectedFiles) {
        formData.append(this.name || "files", file);
      }
      this.setFormValue(formData);
    } else {
      this.setFormValue(this.selectedFiles[0] ?? null);
    }

    this.internals?.setValidity?.({});
  }

  private syncInputFiles(files: FileList | null): void {
    const input = this.inputElement;
    if (!input || !files) {
      return;
    }

    if (typeof FileList !== "undefined" && !(files instanceof FileList)) {
      return;
    }

    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "files");
    descriptor?.set?.call(input, files);
  }

  private get inputElement(): HTMLInputElement | null {
    return this.renderRoot.querySelector("input");
  }

  private get triggerElement(): HTMLElement | null {
    return this.renderRoot.querySelector('[part="trigger"]');
  }
}
