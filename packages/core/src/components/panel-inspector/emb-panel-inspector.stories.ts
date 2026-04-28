type PanelInspectorStoryArgs = {
  sticky: boolean;
};

const meta = {
  title: "Display/Panel Inspector",
  args: {
    sticky: false
  },
  argTypes: {
    sticky: {
      control: "boolean"
    }
  },
  render: ({ sticky }: PanelInspectorStoryArgs) => `
    <emb-panel-inspector
      title="Deployment details"
      description="Review metadata, release health, and supporting actions for the selected deployment."
      ${sticky ? "sticky" : ""}
    >
      <emb-badge slot="meta" tone="accent">Healthy</emb-badge>
      <emb-button slot="actions" variant="ghost">Open logs</emb-button>
      <emb-description-list>
        <emb-description-item>
          <span slot="term">Version</span>
          2026.04.28-1
        </emb-description-item>
        <emb-description-item>
          <span slot="term">Region</span>
          us-east-1
        </emb-description-item>
      </emb-description-list>
      <div slot="footer">Last updated 4 minutes ago by Release Bot.</div>
    </emb-panel-inspector>
  `
};

export default meta;

export const Default = {};
