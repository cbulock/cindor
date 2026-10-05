import { html } from "lit";
import type { DiffViewerHunk, CindorDiffViewer } from "./cindor-diff-viewer.js";

const sample: DiffViewerHunk[] = [{ oldStart: 10, newStart: 10, heading: "settings", lines: [
  { type: "context", text: "config = {" }, { type: "deletion", text: "  enabled: false" },
  { type: "addition", text: "  enabled: true" }, { type: "addition", text: "  retries: 3" },
  { type: "context", text: "}" }
] }];
const render = (hunks = sample, split = false) => html`
  <label>Layout <select @change=${(event: Event) => {
    const select = event.target as HTMLSelectElement;
    const viewer = select.closest("label")?.nextElementSibling as CindorDiffViewer;
    viewer.mode = select.value === "split" ? "split" : "unified";
  }}><option value="unified" ?selected=${!split}>Unified</option><option value="split" ?selected=${split}>Split</option></select></label>
  <cindor-diff-viewer .hunks=${hunks} mode=${split ? "split" : "unified"} label="Configuration changes"></cindor-diff-viewer>`;
export default { title: "Display/Diff Viewer", render: () => render() };
export const Unified = {};
export const Split = { render: () => render(sample, true) };
export const Empty = { render: () => render([]) };
export const MultipleHunks = { render: () => render([...sample, { ...sample[0], oldStart: 50, newStart: 51 }]) };
export const UnequalReplacement = { render: () => render(sample, true) };
export const InsertionAndDeletion = { render: () => render([
  { oldStart: 0, newStart: 1, lines: [{ type: "addition", text: "new file" }] },
  { oldStart: 1, newStart: 0, lines: [{ type: "deletion", text: "removed file" }] }
], true) };
export const Whitespace = { render: () => render([{ oldStart: 1, newStart: 1, lines: [
  { type: "context", text: "" }, { type: "deletion", text: "\t  trailing  " },
  { type: "addition", text: "  " + "long source text ".repeat(30) }
] }], true) };
