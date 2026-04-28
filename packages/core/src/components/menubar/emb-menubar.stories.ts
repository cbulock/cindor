const meta = {
  title: "Navigation/Menubar",
  render: () => `
    <emb-menubar aria-label="Application menu">
      <emb-button variant="ghost">File</emb-button>
      <emb-button variant="ghost">Edit</emb-button>
      <emb-button variant="ghost">View</emb-button>
      <emb-button variant="ghost">Help</emb-button>
    </emb-menubar>
  `
};

export default meta;

export const Default = {};
