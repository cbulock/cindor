const meta = {
  title: "Navigation/Menubar",
  render: () => `
    <cindor-menubar aria-label="Application menu">
      <cindor-button variant="ghost">File</cindor-button>
      <cindor-button variant="ghost">Edit</cindor-button>
      <cindor-button variant="ghost">View</cindor-button>
      <cindor-button variant="ghost">Help</cindor-button>
    </cindor-menubar>
  `
};

export default meta;

export const Default = {};
