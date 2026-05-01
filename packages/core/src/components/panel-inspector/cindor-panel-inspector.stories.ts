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
    <cindor-panel-inspector
      title="Deployment details"
      description="Review metadata, release health, and supporting actions for the selected deployment."
      ${sticky ? "sticky" : ""}
    >
      <cindor-badge slot="meta" tone="accent">Healthy</cindor-badge>
      <cindor-button slot="actions" variant="ghost">Open logs</cindor-button>
      <cindor-description-list>
        <cindor-description-item>
          <span slot="term">Version</span>
          2026.04.28-1
        </cindor-description-item>
        <cindor-description-item>
          <span slot="term">Region</span>
          us-east-1
        </cindor-description-item>
      </cindor-description-list>
      <div slot="footer">Last updated 4 minutes ago by Release Bot.</div>
    </cindor-panel-inspector>
  `
};

export default meta;

export const Default = {};
