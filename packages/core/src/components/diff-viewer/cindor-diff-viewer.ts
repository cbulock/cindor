import { css, html, LitElement, nothing } from "lit";

export type DiffViewerMode = "unified" | "split";
export type DiffViewerLine = { type: "context" | "addition" | "deletion"; text: string };
export type DiffViewerHunk = { oldStart: number; newStart: number; heading?: string; lines: DiffViewerLine[] };
type NumberedLine = DiffViewerLine & { oldNumber?: number; newNumber?: number };

/**
 * Structured, display-only diff with unified and split layouts.
 * Each entry represents one logical line. Replace the hunks array to trigger updates.
 * Split mode pairs changes within each contiguous block, never across context lines.
 * All lines are rendered; parsing, editing, highlighting and virtualization are application concerns.
 * @summary Accessible structured diff presentation.
 * @tag cindor-diff-viewer
 * @csspart surface - Named, keyboard-focusable scrolling surface.
 * @csspart table - Semantic diff table.
 * @csspart hunk - Range and optional heading.
 * @csspart line - Source row.
 * @csspart number - Source line number.
 * @csspart code - Whitespace-preserving source text.
 * @csspart empty - Empty message.
 * @csspart invalid - Invalid input message.
 */
export class CindorDiffViewer extends LitElement {
  static properties = {
    hunks: { attribute: false },
    mode: { reflect: true },
    label: { reflect: true },
    oldLabel: { attribute: "old-label", reflect: true },
    newLabel: { attribute: "new-label", reflect: true },
    emptyMessage: { attribute: "empty-message", reflect: true },
    invalidMessage: { attribute: "invalid-message", reflect: true }
  };

  hunks: DiffViewerHunk[] = [];
  mode: DiffViewerMode = "unified";
  label = "Diff";
  oldLabel = "Before";
  newLabel = "After";
  emptyMessage = "No diff to display.";
  invalidMessage = "Unable to display diff.";

  static styles = css`
    :host { display: block; color: var(--fg); }
    .surface { overflow: auto; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg); }
    .surface:focus-visible { outline: none; box-shadow: var(--ring-focus); }
    table { border-collapse: collapse; min-width: 100%; font: var(--text-sm)/var(--leading-code) var(--font-mono); }
    caption, th { text-align: start; padding: var(--space-2) var(--space-3); background: var(--surface); }
    td { padding: 0 var(--space-3); vertical-align: top; }
    .number { color: var(--fg-muted); text-align: end; width: 3rem; }
    .code { white-space: pre; min-width: 12rem; }
    .addition { background: color-mix(in srgb, var(--success) 12%, var(--bg)); }
    .deletion { background: color-mix(in srgb, var(--danger) 12%, var(--bg)); }
    .marker { display: inline-block; width: 2ch; }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    p { padding: var(--space-3); margin: 0; }
    [part="invalid"] { color: var(--danger); }
  `;

  private valid(): boolean {
    return (this.mode === "unified" || this.mode === "split") && Array.isArray(this.hunks) && this.hunks.every((h) =>
      h && Number.isSafeInteger(h.oldStart) && h.oldStart >= 0 && Number.isSafeInteger(h.newStart) && h.newStart >= 0 &&
      (h.heading === undefined || typeof h.heading === "string") && Array.isArray(h.lines) && h.lines.every((l) =>
        l && ["context", "addition", "deletion"].includes(l.type) && typeof l.text === "string" && !/[\r\n]/.test(l.text)) &&
      (h.oldStart > 0 || h.lines.every((l) => l.type === "addition")) &&
      (h.newStart > 0 || h.lines.every((l) => l.type === "deletion")));
  }

  protected override render() {
    if (!this.valid()) return html`<div class="surface" part="surface"><p part="invalid">${this.invalidMessage}</p></div>`;
    if (!this.hunks.length || this.hunks.every((h) => !h.lines.length)) return html`<div class="surface" part="surface"><p part="empty">${this.emptyMessage}</p></div>`;
    return html`<div class="surface" part="surface" role="region" aria-label=${this.label} tabindex="0">
      <table part="table"><caption>${this.label}</caption><thead><tr>
        <th scope="col">${this.oldLabel} line</th>${this.mode === "split" ? html`<th scope="col">${this.oldLabel} source</th>` : nothing}
        <th scope="col">${this.newLabel} line</th><th scope="col">${this.mode === "split" ? `${this.newLabel} source` : "Change / source"}</th>
      </tr></thead>${this.hunks.map((h) => this.renderHunk(h))}</table></div>`;
  }

  private renderHunk(h: DiffViewerHunk) {
    let oldNumber = h.oldStart;
    let newNumber = h.newStart;
    const lines: NumberedLine[] = h.lines.map((line) => ({ ...line,
      oldNumber: line.type === "addition" ? undefined : oldNumber++,
      newNumber: line.type === "deletion" ? undefined : newNumber++
    }));
    const rows: Array<[NumberedLine | undefined, NumberedLine | undefined]> = [];
    if (this.mode === "split") {
      let i = 0;
      while (i < lines.length) {
        if (lines[i].type === "context") { rows.push([lines[i], lines[i]]); i++; continue; }
        const removed: NumberedLine[] = [];
        const added: NumberedLine[] = [];
        while (i < lines.length && lines[i].type !== "context") {
          const line = lines[i++];
          (line.type === "deletion" ? removed : added).push(line);
        }
        for (let j = 0; j < Math.max(removed.length, added.length); j++) rows.push([removed[j], added[j]]);
      }
    }
    return html`<tbody><tr><th part="hunk" scope="rowgroup" colspan=${this.mode === "split" ? 4 : 3}>@@ -${h.oldStart},${oldNumber - h.oldStart} +${h.newStart},${newNumber - h.newStart} @@ ${h.heading ?? ""}</th></tr>
      ${this.mode === "unified" ? lines.map((l) => html`<tr part="line" class=${l.type}><td part="number" class="number">${l.oldNumber ?? nothing}</td><td part="number" class="number">${l.newNumber ?? nothing}</td>${this.code(l)}</tr>`) : rows.map(([old, next]) => html`<tr part="line">${this.side(old, "oldNumber")}${this.side(next, "newNumber")}</tr>`)}</tbody>`;
  }

  private side(line: NumberedLine | undefined, key: "oldNumber" | "newNumber") {
    return html`<td part="number" class=${`number ${line?.type ?? "absent"}`}>${line?.[key] ?? nothing}</td>${this.code(line)}`;
  }

  private code(line?: NumberedLine) {
    if (!line) return html`<td class="absent" aria-label="No corresponding line"></td>`;
    const description = { context: "Unchanged", addition: "Added", deletion: "Deleted" }[line.type];
    return html`<td part="code" class=${`code ${line.type}`}><span class="sr-only">${description}: </span><span class="marker" aria-hidden="true">${line.type === "addition" ? "+" : line.type === "deletion" ? "-" : " "}</span>${line.text}</td>`;
  }
}
