type SplitButtonStoryArgs = {
  disabled: boolean;
  menuLabel: string;
  variant: "solid" | "ghost";
};

const meta = {
  title: "Actions/Split Button",
  args: {
    disabled: false,
    menuLabel: "More publishing actions",
    variant: "solid"
  },
  argTypes: {
    variant: {
      control: "radio",
      options: ["solid", "ghost"]
    }
  },
  render: ({ disabled, menuLabel, variant }: SplitButtonStoryArgs) => `
    <cindor-split-button ${disabled ? "disabled" : ""} menu-label="${menuLabel}" variant="${variant}">
      <cindor-icon slot="start-icon" name="rocket" size="16"></cindor-icon>
      Publish changes
      <cindor-menu-item slot="menu">Schedule publish</cindor-menu-item>
      <cindor-menu-item slot="menu">Save draft</cindor-menu-item>
      <cindor-menu-item slot="menu">Duplicate draft</cindor-menu-item>
    </cindor-split-button>
  `
};

export default meta;

export const Default = {};

export const Ghost = {
  args: {
    variant: "ghost"
  }
};

export const Disabled = {
  args: {
    disabled: true
  }
};
