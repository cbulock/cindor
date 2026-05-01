const meta = {
  title: "Layout/Layout",
  render: () => `
    <emb-layout>
      <emb-layout-header>
        <emb-stack gap="2">
          <emb-badge tone="accent">Workspace</emb-badge>
          <h2 style="margin: 0;">Release command center</h2>
          <p style="margin: 0;">Compose page-level regions without re-implementing layout scaffolding in each screen.</p>
        </emb-stack>
      </emb-layout-header>
      <emb-layout-content>
        <emb-card>
          <div style="padding: var(--space-4);">Primary content area</div>
        </emb-card>
      </emb-layout-content>
    </emb-layout>
  `
};

export default meta;

export const Default = {};
