type SplitterStoryArgs = {
  orientation: "horizontal" | "vertical";
};

const meta = {
  title: "Display/Splitter",
  args: {
    orientation: "horizontal"
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"]
    }
  },
  render: ({ orientation }: SplitterStoryArgs) => `
    <emb-splitter orientation="${orientation}" style="${orientation === "vertical" ? "height: 24rem;" : "height: 18rem;"}">
      <emb-splitter-panel size="28" style="padding: var(--space-4);">
        <strong>Navigation</strong>
        <p>Resizable side content for filters and app structure.</p>
      </emb-splitter-panel>
      <emb-splitter-panel size="72" style="padding: var(--space-4);">
        <strong>Workspace</strong>
        <p>Main panel content that grows as adjacent panels shrink.</p>
      </emb-splitter-panel>
    </emb-splitter>
  `
};

export default meta;

export const Default = {};
