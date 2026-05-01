const meta = {
  title: "Navigation/Side Nav",
  render: () => `
    <cindor-side-nav aria-label="Documentation">
      <cindor-side-nav-item href="#overview" label="Overview"></cindor-side-nav-item>
      <cindor-side-nav-item expanded label="Guides">
        <cindor-side-nav-item href="#getting-started" label="Getting started" current></cindor-side-nav-item>
        <cindor-side-nav-item href="#theming" label="Theming"></cindor-side-nav-item>
      </cindor-side-nav-item>
      <cindor-side-nav-item expanded label="Components">
        <cindor-side-nav-item href="#button" label="Button"></cindor-side-nav-item>
        <cindor-side-nav-item href="#dialog" label="Dialog"></cindor-side-nav-item>
      </cindor-side-nav-item>
    </cindor-side-nav>
  `
};

export default meta;

export const Default = {};
