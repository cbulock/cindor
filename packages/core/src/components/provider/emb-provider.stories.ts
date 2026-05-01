type ProviderStoryArgs = {
  colorScheme: "inherit" | "light" | "dark";
  theme: "inherit" | "light" | "dark";
};

const meta = {
  title: "Layout/Provider",
  args: {
    colorScheme: "inherit",
    theme: "dark"
  },
  argTypes: {
    colorScheme: {
      control: "select",
      options: ["inherit", "light", "dark"]
    },
    theme: {
      control: "select",
      options: ["inherit", "light", "dark"]
    }
  },
  render: ({ colorScheme, theme }: ProviderStoryArgs) => `
    <emb-provider theme="${theme}" color-scheme="${colorScheme}">
      <emb-card>
        <div style="padding: var(--space-4); display: grid; gap: var(--space-3);">
          <h3 style="margin: 0;">Scoped theme boundary</h3>
          <p style="margin: 0;">Wrap any standard web component consumer and keep token-driven theming local to that subtree.</p>
          <emb-stack direction="horizontal" gap="2" wrap>
            <emb-badge tone="accent">Provider</emb-badge>
            <emb-badge>Theme aware</emb-badge>
          </emb-stack>
        </div>
      </emb-card>
    </emb-provider>
  `
};

export default meta;

export const Default = {};
