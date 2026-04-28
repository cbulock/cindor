const meta = {
  title: "Navigation/Navigation Rail",
  render: () => `
    <emb-navigation-rail aria-label="Workspace sections">
      <emb-navigation-rail-item href="#home" label="Home" current>
        <emb-icon slot="start" name="house"></emb-icon>
      </emb-navigation-rail-item>
      <emb-navigation-rail-item href="#projects" label="Projects">
        <emb-icon slot="start" name="folder-kanban"></emb-icon>
      </emb-navigation-rail-item>
      <emb-navigation-rail-item href="#settings" label="Settings">
        <emb-icon slot="start" name="settings"></emb-icon>
      </emb-navigation-rail-item>
    </emb-navigation-rail>
  `
};

export default meta;

export const Default = {};
