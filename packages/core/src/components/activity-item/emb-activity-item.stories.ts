const meta = {
  title: "Display/Activity Item",
  render: () => `
    <emb-activity-item unread>
      <emb-avatar slot="leading" name="Ops"></emb-avatar>
      <span slot="title">Database failover completed</span>
      <span slot="timestamp">5 minutes ago</span>
      <span slot="meta">Primary cluster</span>
      Connections were restored automatically after the failover.
    </emb-activity-item>
  `
};

export default meta;

export const Default = {};
