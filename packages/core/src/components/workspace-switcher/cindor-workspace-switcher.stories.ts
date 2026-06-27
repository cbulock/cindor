const workspaceItems = [
  {
    value: "ops",
    label: "Operations hub",
    description: "Deployments, incidents, and release health in one place.",
    meta: "Production",
    group: "Pinned"
  },
  {
    value: "design",
    label: "Design systems",
    description: "Tokens, primitives, and review checkpoints for shared UI.",
    meta: "Shared",
    group: "Pinned"
  },
  {
    value: "partner-portal",
    label: "Partner portal",
    description: "External-facing workflows for onboarding and account support.",
    meta: "Last opened today",
    group: "Recent"
  },
  {
    value: "launch-q3",
    label: "Q3 launch",
    description: "Launch checklist, approvals, and rollout comms.",
    meta: "Favorite",
    group: "Recent"
  }
];

const meta = {
  title: "Navigation/Workspace Switcher",
  render: () => `
    <cindor-workspace-switcher id="storybook-workspace-switcher" value="ops"></cindor-workspace-switcher>
    <script type="module">
      const switcher = document.querySelector("#storybook-workspace-switcher");
      switcher.items = ${JSON.stringify(workspaceItems, null, 2)};
    </script>
  `
};

export default meta;

export const Default = {};
