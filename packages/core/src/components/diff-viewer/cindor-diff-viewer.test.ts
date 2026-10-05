import "../../register.js";
import { CindorDiffViewer, type DiffViewerHunk } from "./cindor-diff-viewer.js";

async function mount(hunks: DiffViewerHunk[] = []) {
  const viewer = document.createElement("cindor-diff-viewer") as CindorDiffViewer;
  viewer.hunks = hunks;
  document.body.append(viewer);
  await viewer.updateComplete;
  return viewer;
}
const sample: DiffViewerHunk[] = [{ oldStart: 5, newStart: 8, lines: [
  { type: "deletion", text: "old" }, { type: "addition", text: "new" },
  { type: "addition", text: "extra" }, { type: "context", text: "" },
  { type: "deletion", text: "\t <img>  " }
] }];
describe("cindor-diff-viewer", () => {
  it("renders custom empty and invalid states and recovers", async () => {
    const v = await mount();
    expect(v.renderRoot.querySelector('[part="empty"]')?.textContent).toBe("No diff to display.");
    v.emptyMessage = "Nothing changed";
    await v.updateComplete;
    expect(v.renderRoot.textContent).toContain("Nothing changed");
    v.hunks = [{ oldStart: -1, newStart: 1, lines: [] }];
    v.invalidMessage = "Bad diff";
    await v.updateComplete;
    expect(v.renderRoot.querySelector('[part="invalid"]')?.textContent).toBe("Bad diff");
    v.hunks = sample;
    await v.updateComplete;
    expect(v.renderRoot.querySelector("table")).not.toBeNull();
  });
  it("preserves unified order, offsets, whitespace and safe source text", async () => {
    const v = await mount([...sample, { oldStart: 100, newStart: 200, lines: [{ type: "context", text: "end" }] }]);
    const rows = [...v.renderRoot.querySelectorAll('[part="line"]')];
    expect(rows.map((r) => [...r.querySelectorAll('[part="number"]')].map((n) => n.textContent))).toEqual([
      ["5", ""], ["", "8"], ["", "9"], ["6", "10"], ["7", ""], ["100", "200"]
    ]);
    expect(rows[4].querySelector('[part="code"]')?.textContent).toContain("\t <img>  ");
    expect(v.renderRoot.querySelector("img")).toBeNull();
    expect(v.renderRoot.textContent).toContain("@@ -5,3 +8,3 @@");
  });
  it("pairs split blocks and distinguishes padding from blank lines", async () => {
    const v = await mount(sample);
    v.mode = "split";
    await v.updateComplete;
    const rows = [...v.renderRoot.querySelectorAll('[part="line"]')];
    expect(rows).toHaveLength(4);
    expect(rows[0].textContent).toContain("old");
    expect(rows[0].textContent).toContain("new");
    expect(rows[1].querySelectorAll('[aria-label="No corresponding line"]')).toHaveLength(1);
    expect(rows[2].querySelectorAll('[part="code"]')).toHaveLength(2);
    expect(rows[3].textContent).not.toContain("extra");
    expect(v.renderRoot.querySelector('[role="region"]')?.getAttribute("tabindex")).toBe("0");
    expect(v.renderRoot.querySelector("caption")?.textContent).toBe("Diff");
    expect(v.renderRoot.querySelectorAll('th[scope="col"]')).toHaveLength(4);
    expect(v.renderRoot.querySelectorAll("[tabindex]")).toHaveLength(1);
    expect(v.renderRoot.textContent).toContain("Deleted:");
  });
  it("supports zero starts for insertion and deletion only", async () => {
    const v = await mount([{ oldStart: 0, newStart: 1, lines: [{ type: "addition", text: "a" }] },
      { oldStart: 1, newStart: 0, lines: [{ type: "deletion", text: "b" }] }]);
    expect(v.renderRoot.textContent).toContain("@@ -0,0 +1,1 @@");
    expect(v.renderRoot.textContent).toContain("@@ -1,1 +0,0 @@");
  });
  it.each([null, {}, [{ oldStart: 1, newStart: 1, lines: [null] }],
    [{ oldStart: 1, newStart: 1, lines: [{ type: "addition", text: "two\nlines" }] }]])("rejects malformed input %j", async (input) => {
    const v = await mount(input as DiffViewerHunk[]);
    expect(v.renderRoot.querySelector('[part="invalid"]')).not.toBeNull();
  });
});
