const meta = {
  title: "Display/Page Header",
  render: () => `
    <cindor-page-header
      eyebrow="Workspace"
      title="Release overview"
      description="Track deployment health, incidents, and pending approvals without leaving the current page."
    >
      <cindor-breadcrumbs slot="breadcrumbs">
        <a href="/">Home</a>
        <a href="/workspaces">Workspaces</a>
        <a href="/releases">Releases</a>
      </cindor-breadcrumbs>
      <cindor-badge slot="meta" tone="accent">Production</cindor-badge>
      <cindor-badge slot="meta">12 services</cindor-badge>
      <cindor-button slot="actions" variant="ghost">Share</cindor-button>
      <cindor-button slot="actions">Deploy</cindor-button>
      <cindor-toolbar aria-label="Release filters">
        <cindor-button variant="ghost">Today</cindor-button>
        <cindor-button variant="ghost">Last 7 days</cindor-button>
      </cindor-toolbar>
    </cindor-page-header>
  `
};

export default meta;

export const Default = {};
