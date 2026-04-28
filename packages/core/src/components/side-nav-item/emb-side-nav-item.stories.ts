type SideNavItemStoryArgs = {
  current: boolean;
  expanded: boolean;
};

const meta = {
  title: "Navigation/Side Nav Item",
  args: {
    current: true,
    expanded: true
  },
  argTypes: {
    current: {
      control: "boolean"
    },
    expanded: {
      control: "boolean"
    }
  },
  render: ({ current, expanded }: SideNavItemStoryArgs) => `
    <emb-side-nav-item label="Components" ${expanded ? "expanded" : ""}>
      <emb-side-nav-item href="#button" label="Button" ${current ? "current" : ""}></emb-side-nav-item>
      <emb-side-nav-item href="#dialog" label="Dialog"></emb-side-nav-item>
    </emb-side-nav-item>
  `
};

export default meta;

export const Default = {};
