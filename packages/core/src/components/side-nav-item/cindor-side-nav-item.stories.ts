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
    <cindor-side-nav-item label="Components" ${expanded ? "expanded" : ""}>
      <cindor-side-nav-item href="#button" label="Button" ${current ? "current" : ""}></cindor-side-nav-item>
      <cindor-side-nav-item href="#dialog" label="Dialog"></cindor-side-nav-item>
    </cindor-side-nav-item>
  `
};

export default meta;

export const Default = {};
