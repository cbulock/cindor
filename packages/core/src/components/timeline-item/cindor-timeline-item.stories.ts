const meta = {
  title: "Display/Timeline Item",
  render: () => `
    <cindor-timeline>
      <cindor-timeline-item>
        <span slot="title">Deployed</span>
        <span slot="timestamp">2m ago</span>
        Release 1.2.0 shipped to production.
      </cindor-timeline-item>
    </cindor-timeline>
  `
};

export default meta;

export const Default = {};
