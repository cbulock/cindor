const meta = {
  title: "Display/Activity Feed",
  render: () => `
    <cindor-activity-feed>
      <cindor-activity-item unread>
        <cindor-avatar slot="leading" name="Cindor Team"></cindor-avatar>
        <span slot="title">New deployment completed</span>
        <span slot="timestamp">2 minutes ago</span>
        <span slot="meta">Production environment</span>
        Traffic is now flowing through the latest release.
      </cindor-activity-item>
      <cindor-activity-item>
        <cindor-avatar slot="leading" name="QA"></cindor-avatar>
        <span slot="title">Regression suite passed</span>
        <span slot="timestamp">Yesterday</span>
        <span slot="meta">Build #1284</span>
        All smoke tests completed without failures.
      </cindor-activity-item>
    </cindor-activity-feed>
  `
};

export default meta;

export const Default = {};
