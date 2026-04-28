const meta = {
  title: "Display/Timeline",
  render: () => `
    <emb-timeline>
      <emb-timeline-item>
        <span slot="title">Project created</span>
        <span slot="timestamp">Apr 20</span>
        Initial workspace scaffolded.
      </emb-timeline-item>
      <emb-timeline-item>
        <span slot="title">First release</span>
        <span slot="timestamp">Apr 24</span>
        Shared components published internally.
      </emb-timeline-item>
      <emb-timeline-item>
        <span slot="title">Production launch</span>
        <span slot="timestamp">Today</span>
        Traffic is now routed to the new system.
      </emb-timeline-item>
    </emb-timeline>
  `
};

export default meta;

export const Default = {};
