const meta = {
  title: "Layout/Layout Content",
  render: () => `
    <emb-layout-content>
      <emb-stack gap="3">
        <emb-card>
          <div style="padding: var(--space-4);">Metrics and summaries</div>
        </emb-card>
        <emb-card>
          <div style="padding: var(--space-4);">Forms, tables, and detail panels</div>
        </emb-card>
      </emb-stack>
    </emb-layout-content>
  `
};

export default meta;

export const Default = {};
