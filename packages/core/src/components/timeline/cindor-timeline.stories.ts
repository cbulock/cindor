const meta = {
  title: "Display/Timeline",
  render: () => `
    <cindor-timeline>
      <cindor-timeline-item>
        <span slot="title">Project created</span>
        <span slot="timestamp">Apr 20</span>
        Initial workspace scaffolded.
      </cindor-timeline-item>
      <cindor-timeline-item>
        <span slot="title">First release</span>
        <span slot="timestamp">Apr 24</span>
        Shared components published internally.
      </cindor-timeline-item>
      <cindor-timeline-item>
        <span slot="title">Production launch</span>
        <span slot="timestamp">Today</span>
        Traffic is now routed to the new system.
      </cindor-timeline-item>
    </cindor-timeline>
  `
};

export default meta;

export const Default = {};
