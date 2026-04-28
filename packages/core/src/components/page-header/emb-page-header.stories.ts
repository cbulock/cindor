const meta = {
  title: "Display/Page Header",
  render: () => `
    <emb-page-header
      eyebrow="Workspace"
      title="Release overview"
      description="Track deployment health, incidents, and pending approvals without leaving the current page."
    >
      <emb-breadcrumbs slot="breadcrumbs">
        <a href="/">Home</a>
        <a href="/workspaces">Workspaces</a>
        <a href="/releases">Releases</a>
      </emb-breadcrumbs>
      <emb-badge slot="meta" tone="accent">Production</emb-badge>
      <emb-badge slot="meta">12 services</emb-badge>
      <emb-button slot="actions" variant="ghost">Share</emb-button>
      <emb-button slot="actions">Deploy</emb-button>
      <emb-toolbar aria-label="Release filters">
        <emb-button variant="ghost">Today</emb-button>
        <emb-button variant="ghost">Last 7 days</emb-button>
      </emb-toolbar>
    </emb-page-header>
  `
};

export default meta;

export const Default = {};
