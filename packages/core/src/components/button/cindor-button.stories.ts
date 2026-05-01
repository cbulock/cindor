type ButtonStoryArgs = {
  disabled: boolean;
  endIcon: boolean;
  label: string;
  startIcon: boolean;
  type: "button" | "submit" | "reset";
  variant: "solid" | "ghost";
};

const meta = {
  title: "Primitives/Button",
  args: {
    disabled: false,
    endIcon: false,
    label: "Save",
    startIcon: false,
    type: "button",
    variant: "solid"
  },
  argTypes: {
    type: {
      control: "radio",
      options: ["button", "submit", "reset"]
    },
    variant: {
      control: "radio",
      options: ["solid", "ghost"]
    }
  },
  render: ({ disabled, endIcon, label, startIcon, type, variant }: ButtonStoryArgs) => `
    <cindor-button ${disabled ? "disabled" : ""} type="${type}" variant="${variant}">
      ${startIcon ? '<cindor-icon slot="start-icon" name="upload" size="16"></cindor-icon>' : ""}
      ${label}
      ${endIcon ? '<cindor-icon slot="end-icon" name="chevron-right" size="16"></cindor-icon>' : ""}
    </cindor-button>
  `
};

export default meta;

export const Default = {};

export const Ghost = {
  args: {
    variant: "ghost"
  }
};

export const WithStartIcon = {
  args: {
    startIcon: true
  }
};

export const WithEndIcon = {
  args: {
    endIcon: true
  }
};
