const meta = {
  title: "Display/Timeline Item",
  render: () => `
    <emb-timeline>
      <emb-timeline-item>
        <span slot="title">Deployed</span>
        <span slot="timestamp">2m ago</span>
        Release 1.2.0 shipped to production.
      </emb-timeline-item>
    </emb-timeline>
  `
};

export default meta;

export const Default = {};
