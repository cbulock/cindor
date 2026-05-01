const meta = {
  title: "Layout/Layout Content",
  render: () => `
    <cindor-layout-content>
      <cindor-stack gap="3">
        <cindor-card>
          <div style="padding: var(--space-4);">Metrics and summaries</div>
        </cindor-card>
        <cindor-card>
          <div style="padding: var(--space-4);">Forms, tables, and detail panels</div>
        </cindor-card>
      </cindor-stack>
    </cindor-layout-content>
  `
};

export default meta;

export const Default = {};
