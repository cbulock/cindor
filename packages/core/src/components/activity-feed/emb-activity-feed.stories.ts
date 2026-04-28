const meta = {
  title: "Display/Activity Feed",
  render: () => `
    <emb-activity-feed>
      <emb-activity-item unread>
        <emb-avatar slot="leading" name="Ember Team"></emb-avatar>
        <span slot="title">New deployment completed</span>
        <span slot="timestamp">2 minutes ago</span>
        <span slot="meta">Production environment</span>
        Traffic is now flowing through the latest release.
      </emb-activity-item>
      <emb-activity-item>
        <emb-avatar slot="leading" name="QA"></emb-avatar>
        <span slot="title">Regression suite passed</span>
        <span slot="timestamp">Yesterday</span>
        <span slot="meta">Build #1284</span>
        All smoke tests completed without failures.
      </emb-activity-item>
    </emb-activity-feed>
  `
};

export default meta;

export const Default = {};
