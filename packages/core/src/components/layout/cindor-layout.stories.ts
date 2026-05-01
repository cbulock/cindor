const meta = {
  title: "Layout/Layout",
  render: () => `
    <cindor-layout>
      <cindor-layout-header>
        <cindor-stack gap="2">
          <cindor-badge tone="accent">Workspace</cindor-badge>
          <h2 style="margin: 0;">Release command center</h2>
          <p style="margin: 0;">Compose page-level regions without re-implementing layout scaffolding in each screen.</p>
        </cindor-stack>
      </cindor-layout-header>
      <cindor-layout-content>
        <cindor-card>
          <div style="padding: var(--space-4);">Primary content area</div>
        </cindor-card>
      </cindor-layout-content>
    </cindor-layout>
  `
};

export default meta;

export const Default = {};
