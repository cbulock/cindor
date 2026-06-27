const samplePayload = {
  deployment: {
    environment: "production",
    regions: ["iad", "ord", "sfo"],
    startedAt: "2026-06-27T23:45:00Z",
    status: "healthy"
  },
  flags: {
    dryRun: false,
    notifyTeam: true
  },
  requestId: "req_1024"
};

const meta = {
  title: "Display/JSON Viewer",
  render: () => `
    <cindor-json-viewer id="storybook-json-viewer" root-label="Deploy payload" expanded-depth="2"></cindor-json-viewer>
    <script type="module">
      const viewer = document.querySelector("#storybook-json-viewer");
      viewer.data = ${JSON.stringify(samplePayload, null, 2)};
    </script>
  `
};

export default meta;

export const Default = {};
