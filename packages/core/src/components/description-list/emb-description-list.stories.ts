const meta = {
  title: "Display/Description List",
  render: () => `
    <emb-description-list>
      <emb-description-item>
        <span slot="term">Status</span>
        Healthy
      </emb-description-item>
      <emb-description-item>
        <span slot="term">Region</span>
        us-east-1
      </emb-description-item>
      <emb-description-item>
        <span slot="term">Updated</span>
        2 minutes ago
      </emb-description-item>
    </emb-description-list>
  `
};

export default meta;

export const Default = {};
