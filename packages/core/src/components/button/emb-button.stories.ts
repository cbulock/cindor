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
    <emb-button ${disabled ? "disabled" : ""} type="${type}" variant="${variant}">
      ${startIcon ? '<emb-icon slot="start-icon" name="upload" size="16"></emb-icon>' : ""}
      ${label}
      ${endIcon ? '<emb-icon slot="end-icon" name="chevron-right" size="16"></emb-icon>' : ""}
    </emb-button>
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
