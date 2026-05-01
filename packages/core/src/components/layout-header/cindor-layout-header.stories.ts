const meta = {
  title: "Layout/Layout Header",
  render: () => `
    <cindor-layout-header>
      <cindor-stack gap="2">
        <cindor-breadcrumbs>
          <a href="#overview">Home</a>
          <a href="#releases">Releases</a>
        </cindor-breadcrumbs>
        <h2 style="margin: 0;">Release overview</h2>
        <cindor-stack direction="horizontal" gap="2" wrap align="center">
          <cindor-badge tone="accent">Production</cindor-badge>
          <cindor-button>Deploy</cindor-button>
          <cindor-button variant="ghost">Share</cindor-button>
        </cindor-stack>
      </cindor-stack>
    </cindor-layout-header>
  `
};

export default meta;

export const Default = {};
