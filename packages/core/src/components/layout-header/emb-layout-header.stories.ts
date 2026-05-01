const meta = {
  title: "Layout/Layout Header",
  render: () => `
    <emb-layout-header>
      <emb-stack gap="2">
        <emb-breadcrumbs>
          <a href="#overview">Home</a>
          <a href="#releases">Releases</a>
        </emb-breadcrumbs>
        <h2 style="margin: 0;">Release overview</h2>
        <emb-stack direction="horizontal" gap="2" wrap align="center">
          <emb-badge tone="accent">Production</emb-badge>
          <emb-button>Deploy</emb-button>
          <emb-button variant="ghost">Share</emb-button>
        </emb-stack>
      </emb-stack>
    </emb-layout-header>
  `
};

export default meta;

export const Default = {};
