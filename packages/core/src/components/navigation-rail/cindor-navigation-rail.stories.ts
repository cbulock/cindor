const meta = {
  title: "Navigation/Navigation Rail",
  render: () => `
    <cindor-navigation-rail aria-label="Workspace sections">
      <cindor-navigation-rail-item href="#home" label="Home" current>
        <cindor-icon slot="start" name="house"></cindor-icon>
      </cindor-navigation-rail-item>
      <cindor-navigation-rail-item href="#projects" label="Projects">
        <cindor-icon slot="start" name="folder-kanban"></cindor-icon>
      </cindor-navigation-rail-item>
      <cindor-navigation-rail-item href="#settings" label="Settings">
        <cindor-icon slot="start" name="settings"></cindor-icon>
      </cindor-navigation-rail-item>
    </cindor-navigation-rail>
  `
};

export default meta;

export const Default = {};
