import { css, html, LitElement, nothing, type TemplateResult } from "lit";

export type JsonViewerValue =
  | boolean
  | null
  | number
  | string
  | undefined
  | JsonViewerValue[]
  | { [key: string]: JsonViewerValue };

type JsonViewerNode =
  | { kind: "array"; items: JsonViewerNode[] }
  | { kind: "boolean"; value: boolean }
  | { kind: "null" }
  | { kind: "number"; value: number }
  | { entries: Array<[string, JsonViewerNode]>; kind: "object" }
  | { kind: "string"; value: string }
  | { kind: "undefined" }
  | { kind: "unsupported"; value: string };

type JsonViewerState =
  | { kind: "empty" }
  | { kind: "invalid"; message: string }
  | { kind: "ready"; node: JsonViewerNode };

/**
 * Collapsible structured JSON viewer for payloads, settings, and logs.
 *
 * Pass a JSON string through `value` or assign structured data directly to `data`.
 *
 * @summary Collapsible JSON inspection surface for nested payloads.
 * @tag cindor-json-viewer
 */
export class CindorJsonViewer extends LitElement {
  static styles = css`
    :host {
      display: block;
      color: var(--fg);
      --cindor-json-viewer-background: var(--surface-inverse);
      --cindor-json-viewer-border: var(--border);
      --cindor-json-viewer-font-family: var(--font-mono);
      --cindor-json-viewer-line-color: color-mix(in srgb, var(--border) 72%, transparent);
    }

    :host-context([data-theme="dark"]),
    :host-context([data-theme="retro"]) {
      --cindor-json-viewer-background: var(--bg);
      --cindor-json-viewer-border: var(--border-strong);
      --cindor-json-viewer-line-color: color-mix(in srgb, var(--border-strong) 78%, transparent);
    }

    .surface {
      display: grid;
      gap: var(--space-3);
      padding: var(--space-4);
      border: 1px solid var(--cindor-json-viewer-border);
      border-radius: var(--radius-xl);
      background: var(--cindor-json-viewer-background);
      color: var(--fg);
      font-family: var(--cindor-json-viewer-font-family);
      font-size: var(--text-sm);
      line-height: var(--leading-code);
      letter-spacing: var(--tracking-code);
      overflow: auto;
    }

    .empty,
    .invalid {
      margin: 0;
      color: var(--fg-muted);
      font-family: var(--font-sans);
      font-size: var(--text-sm);
      letter-spacing: normal;
    }

    .invalid {
      color: var(--danger);
    }

    details {
      margin: 0;
    }

    summary {
      display: flex;
      gap: var(--space-2);
      align-items: baseline;
      cursor: pointer;
      list-style: none;
    }

    summary:focus-visible {
      outline: none;
      border-radius: var(--radius-sm);
      box-shadow: var(--ring-focus);
    }

    summary::-webkit-details-marker {
      display: none;
    }

    .summary,
    .row {
      min-block-size: 1.5rem;
    }

    .summary::before {
      content: "▸";
      color: var(--fg-muted);
      transform-origin: center;
      transition: transform var(--duration-fast) var(--ease-out);
    }

    details[open] > summary::before {
      transform: rotate(90deg);
    }

    .children {
      display: grid;
      gap: var(--space-2);
      margin-block-start: var(--space-2);
      margin-inline-start: var(--space-4);
      padding-inline-start: var(--space-3);
      border-inline-start: 1px solid var(--cindor-json-viewer-line-color);
    }

    .row {
      display: flex;
      gap: var(--space-2);
      align-items: baseline;
      flex-wrap: wrap;
    }

    .key {
      color: #fcd34d;
      word-break: break-word;
    }

    .meta,
    .separator {
      color: var(--fg-muted);
    }

    .value-string {
      color: #86efac;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .value-number {
      color: #93c5fd;
    }

    .value-boolean {
      color: #c4b5fd;
    }

    .value-null,
    .value-undefined,
    .value-unsupported {
      color: #fda4af;
    }
  `;

  static properties = {
    data: { attribute: false },
    emptyMessage: { reflect: true, attribute: "empty-message" },
    expandedDepth: { type: Number, reflect: true, attribute: "expanded-depth" },
    invalidMessage: { reflect: true, attribute: "invalid-message" },
    rootLabel: { reflect: true, attribute: "root-label" },
    value: { reflect: true }
  };

  data: JsonViewerValue | Record<string, unknown> | unknown[] | undefined = undefined;
  emptyMessage = "No JSON to display.";
  expandedDepth = 1;
  invalidMessage = "Unable to parse JSON.";
  rootLabel = "JSON";
  value = "";

  protected override render() {
    const state = this.viewerState;

    if (state.kind === "empty") {
      return html`<div class="surface" part="surface"><p class="empty" part="empty">${this.emptyMessage}</p></div>`;
    }

    if (state.kind === "invalid") {
      return html`
        <div class="surface" part="surface">
          <p class="invalid" part="invalid">${this.invalidMessage}${state.message ? ` ${state.message}` : ""}</p>
        </div>
      `;
    }

    return html`
      <section class="surface" part="surface" aria-label=${this.rootLabel}>
        ${this.renderNode(state.node, this.rootLabel, 0, true)}
      </section>
    `;
  }

  private renderNode(node: JsonViewerNode, label: string, depth: number, isRoot = false): TemplateResult {
    if (node.kind === "array") {
      return html`
        <details class="node node-array" part=${isRoot ? "root collection" : "collection"} ?open=${depth < this.expandedDepth}>
          <summary class="summary" part="summary">
            <span class="key" part="key">${label}</span>
            <span class="meta" part="meta">[${node.items.length} item${node.items.length === 1 ? "" : "s"}]</span>
          </summary>
          <div class="children" part="children">
            ${node.items.map((item, index) => this.renderNode(item, `[${index}]`, depth + 1))}
          </div>
        </details>
      `;
    }

    if (node.kind === "object") {
      return html`
        <details class="node node-object" part=${isRoot ? "root collection" : "collection"} ?open=${depth < this.expandedDepth}>
          <summary class="summary" part="summary">
            <span class="key" part="key">${label}</span>
            <span class="meta" part="meta">{${node.entries.length} key${node.entries.length === 1 ? "" : "s"}}</span>
          </summary>
          <div class="children" part="children">
            ${node.entries.map(([entryLabel, entryNode]) => this.renderNode(entryNode, entryLabel, depth + 1))}
          </div>
        </details>
      `;
    }

    return html`
      <div class="row" part="row">
        <span class="key" part="key">${label}</span>
        <span class="separator" aria-hidden="true">:</span>
        <span class=${`value value-${node.kind}`} part="value">${this.renderPrimitive(node)}</span>
      </div>
    `;
  }

  private renderPrimitive(node: Exclude<JsonViewerNode, { kind: "array" } | { kind: "object" }>): string | typeof nothing {
    switch (node.kind) {
      case "string":
        return JSON.stringify(node.value);
      case "number":
        return String(node.value);
      case "boolean":
        return String(node.value);
      case "null":
        return "null";
      case "undefined":
        return "undefined";
      case "unsupported":
        return node.value;
      default:
        return nothing;
    }
  }

  private get viewerState(): JsonViewerState {
    if (this.data !== undefined) {
      return {
        kind: "ready",
        node: this.normalizeValue(this.data)
      };
    }

    const source = this.value.trim();
    if (source === "") {
      return { kind: "empty" };
    }

    try {
      return {
        kind: "ready",
        node: this.normalizeValue(JSON.parse(source) as JsonViewerValue)
      };
    } catch (error) {
      return {
        kind: "invalid",
        message: error instanceof Error && error.message ? `(${error.message})` : ""
      };
    }
  }

  private normalizeValue(value: unknown): JsonViewerNode {
    if (value === null) {
      return { kind: "null" };
    }

    if (Array.isArray(value)) {
      return {
        kind: "array",
        items: value.map((item) => this.normalizeValue(item))
      };
    }

    switch (typeof value) {
      case "boolean":
        return { kind: "boolean", value };
      case "number":
        return { kind: "number", value };
      case "string":
        return { kind: "string", value };
      case "undefined":
        return { kind: "undefined" };
      case "object":
        if (value instanceof Date) {
          return { kind: "string", value: value.toISOString() };
        }

        return {
          kind: "object",
          entries: Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => [key, this.normalizeValue(entryValue)])
        };
      default:
        return { kind: "unsupported", value: String(value) };
    }
  }
}
