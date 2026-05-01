const meta = {
  title: "Display/Description List",
  render: () => `
    <cindor-description-list>
      <cindor-description-item>
        <span slot="term">Status</span>
        Healthy
      </cindor-description-item>
      <cindor-description-item>
        <span slot="term">Region</span>
        us-east-1
      </cindor-description-item>
      <cindor-description-item>
        <span slot="term">Updated</span>
        2 minutes ago
      </cindor-description-item>
    </cindor-description-list>
  `
};

export default meta;

export const Default = {};
