import { css, html, LitElement } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";

export type CommandPaletteCommand = {
  description?: string;
  disabled?: boolean;
  keywords?: string[];
  label: string;
  shortcut?: string;
  value: string;
};

export class CindorCommandPalette extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }

    .surface {
      display: grid;
      gap: var(--space-4);
      min-inline-size: min(90vw, 32rem);
    }

    .header {
      display: grid;
      gap: var(--space-1);
    }

    .title {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
    }

    .caption {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }

    cindor-listbox {
      max-block-size: 20rem;
      overflow: auto;
    }

    cindor-option::part(surface) {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: start;
      gap: var(--space-2);
    }

    .option-body {
      display: grid;
      gap: var(--space-1);
    }

    .option-label {
      font-weight: 600;
    }

    .option-description,
    .empty {
      color: var(--fg-muted);
      font-size: var(--text-sm);
    }

    .shortcut {
      display: inline-flex;
      align-items: center;
      min-height: 1.5rem;
      padding: 0 var(--space-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      background: var(--bg-subtle);
      color: var(--fg-muted);
      font-size: var(--text-xs);
      white-space: nowrap;
    }

    .empty {
      margin: 0;
      padding: var(--space-3);
      border: 1px dashed var(--border);
      border-radius: var(--radius-lg);
      text-align: center;
    }
  `;

  static properties = {
    commands: { attribute: false },
    emptyMessage: { reflect: true, attribute: "empty-message" },
    open: { type: Boolean, reflect: true },
    placeholder: { reflect: true },
    query: { reflect: true },
    title: { reflect: true },
    value: { reflect: true }
  };

  commands: CommandPaletteCommand[] = [];
  emptyMessage = "No matching commands.";
  open = false;
  placeholder = "Search commands";
  query = "";
  title = "Command palette";
  value = "";

  private activeIndex = 0;
  private focusSearchOnOpen = false;

  close(): void {
    this.open = false;
  }

  show(): void {
    this.query = "";
    this.activeIndex = 0;
    this.open = true;
  }

  protected override render() {
    const commands = this.filteredCommands;
    const activeCommand = commands[this.activeIndex];

    return html`
      <cindor-dialog
        aria-label=${ifDefined(this.title || undefined)}
        ?open=${this.open}
        @cancel=${this.handleCancel}
        @close=${this.handleClose}
      >
        <div class="surface" @keydown=${this.handleKeyDown}>
          <div class="header">
            <h2 class="title" part="title">${this.title}</h2>
            <span class="caption" part="caption">Search, filter, and launch actions without leaving the keyboard.</span>
          </div>

          <cindor-search
            aria-label="Search commands"
            part="search"
            .value=${this.query}
            placeholder=${this.placeholder}
            @input=${this.handleInput}
          ></cindor-search>

          ${commands.length
            ? html`
                <cindor-listbox active-index=${String(this.activeIndex)} part="listbox">
                  ${commands.map(
                    (command) => html`
                      <cindor-option
                        ?disabled=${Boolean(command.disabled)}
                        label=${command.label}
                        value=${command.value}
                        @option-select=${this.handleOptionSelect}
                      >
                        <span class="option-body">
                          <span class="option-label">${command.label}</span>
                          ${command.description ? html`<span class="option-description">${command.description}</span>` : null}
                        </span>
                        ${command.shortcut ? html`<span class="shortcut">${command.shortcut}</span>` : null}
                      </cindor-option>
                    `
                  )}
                </cindor-listbox>
              `
            : html`<p class="empty" part="empty">${this.emptyMessage}</p>`}

          ${activeCommand?.description ? html`<span class="caption" part="active-description">${activeCommand.description}</span>` : null}
        </div>
      </cindor-dialog>
    `;
  }

  protected override updated(changedProperties: Map<PropertyKey, unknown>): void {
    if (changedProperties.has("commands") || changedProperties.has("query")) {
      this.normalizeActiveIndex();
    }

    if (changedProperties.has("open") && this.open) {
      this.focusSearchOnOpen = true;
      this.normalizeActiveIndex();
    }

    if (changedProperties.has("open") && !this.open) {
      this.activeIndex = 0;
    }

    if (this.focusSearchOnOpen && this.open) {
      this.focusSearchOnOpen = false;
      requestAnimationFrame(() => {
        this.searchElement?.focus();
      });
    }
  }

  private handleCancel = (event: Event): void => {
    event.stopPropagation();
    this.open = false;
    this.dispatchEvent(new Event("cancel", { bubbles: true, composed: true }));
  };

  private handleClose = (event: Event): void => {
    event.stopPropagation();
    this.open = false;
    this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
  };

  private handleInput = (event: Event): void => {
    const input = event.currentTarget as { value?: string };
    this.query = input.value ?? "";
    this.activeIndex = 0;
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    const commands = this.filteredCommands;
    if (!commands.length) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % commands.length;
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.activeIndex = (this.activeIndex - 1 + commands.length) % commands.length;
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      this.selectCommand(commands[this.activeIndex]);
    }
  };

  private handleOptionSelect = (event: Event): void => {
    event.stopPropagation();
    const optionEvent = event as CustomEvent<{ value?: string }>;
    const command = this.filteredCommands.find((candidate) => candidate.value === optionEvent.detail?.value);
    if (!command) {
      return;
    }

    this.selectCommand(command);
  };

  private normalizeActiveIndex(): void {
    const commands = this.filteredCommands;
    if (!commands.length) {
      this.activeIndex = 0;
      return;
    }

    this.activeIndex = Math.max(0, Math.min(this.activeIndex, commands.length - 1));
  }

  private selectCommand(command: CommandPaletteCommand): void {
    if (command.disabled) {
      return;
    }

    this.value = command.value;
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    this.dispatchEvent(
      new CustomEvent("command-select", {
        bubbles: true,
        composed: true,
        detail: { command, value: command.value }
      })
    );
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    this.open = false;
  }

  private get filteredCommands(): CommandPaletteCommand[] {
    const query = this.query.trim().toLowerCase();
    if (!query) {
      return this.commands;
    }

    return this.commands.filter((command) => {
      const haystack = [command.label, command.description ?? "", ...(command.keywords ?? [])].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }

  private get searchElement(): HTMLElement | null {
    return this.renderRoot.querySelector("cindor-search");
  }
}
