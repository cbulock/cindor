const meta = {
  title: "Display/Activity Item",
  render: () => `
    <cindor-activity-item unread>
      <cindor-avatar slot="leading" name="Ops"></cindor-avatar>
      <span slot="title">Database failover completed</span>
      <span slot="timestamp">5 minutes ago</span>
      <span slot="meta">Primary cluster</span>
      Connections were restored automatically after the failover.
    </cindor-activity-item>
  `
};

export default meta;

export const Default = {};
