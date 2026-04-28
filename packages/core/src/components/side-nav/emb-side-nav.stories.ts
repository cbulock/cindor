const meta = {
  title: "Navigation/Side Nav",
  render: () => `
    <emb-side-nav aria-label="Documentation">
      <emb-side-nav-item href="#overview" label="Overview"></emb-side-nav-item>
      <emb-side-nav-item expanded label="Guides">
        <emb-side-nav-item href="#getting-started" label="Getting started" current></emb-side-nav-item>
        <emb-side-nav-item href="#theming" label="Theming"></emb-side-nav-item>
      </emb-side-nav-item>
      <emb-side-nav-item expanded label="Components">
        <emb-side-nav-item href="#button" label="Button"></emb-side-nav-item>
        <emb-side-nav-item href="#dialog" label="Dialog"></emb-side-nav-item>
      </emb-side-nav-item>
    </emb-side-nav>
  `
};

export default meta;

export const Default = {};
