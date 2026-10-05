# Diff viewer review for Cameron

Implemented `cindor-diff-viewer` with property-only `hunks`, application-controlled
`mode` (`unified` or `split`), and configurable label, old/new labels, empty and
invalid messages. Exported core types and generated React/Vue wrappers are wired
into registration, manifests, Storybook and the docs catalog.

```js
viewer.hunks = [{ oldStart: 1, newStart: 1, heading: "Settings", lines: [
  { type: "deletion", text: "enabled: false" },
  { type: "addition", text: "enabled: true" }
] }];
viewer.mode = "split";
```

Each entry is one logical line (no CR/LF). Starts are nonnegative safe integers;
zero starts are allowed on a side that consumes no lines. Replace the array to
update. Split mode pairs deletions/additions in encounter order within a change
block, pads unequal sides, and repeats context. Text is interpolated safely and
whitespace is preserved. Padding has an accessible absence label; empty source
lines remain actual source cells.

Implementation self-review covered hunk counter resets, split boundaries,
zero-start ranges, public exports/registration, property binding, table caption
and column headers, non-color change labels, and a single focusable named scroll
region. This is display-only and renders all lines: no parsing, editing,
highlighting, virtualization or review actions.

Validation: both generators, typecheck, lint and build passed. Focused tests:
18 passed. Full suite: 126 files / 456 tests passed. The initial focused attempt
failed before tests because the default temporary directory was unavailable;
rerunning with TMPDIR inside the worktree passed. React client mounting could
not be meaningfully exercised with the Node-mode @lit/react export; React tests
check generated wiring, while Vue tests mount and update structured properties.
Storybook browser testing failed before tests because the sandbox denied its
local listening socket (and its user-directory initialization).

Remaining review: real keyboard scrolling, native preview controls, theme
contrast, screen-reader usability, narrow layouts and React client property
updates in a browser. Build emitted the existing-style large-chunk warning.
No independent reviewer has reviewed this artifact. No publication, commit or
PR was performed.
