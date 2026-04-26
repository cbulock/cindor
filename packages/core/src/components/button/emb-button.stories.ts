type ButtonStoryArgs = {
  disabled: boolean;
  label: string;
  type: "button" | "submit" | "reset";
  variant: "solid" | "ghost";
};

const meta = {
  title: "Components/Button",
  args: {
    disabled: false,
    label: "Save",
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
  render: ({ disabled, label, type, variant }: ButtonStoryArgs) =>
    `<emb-button ${disabled ? "disabled" : ""} type="${type}" variant="${variant}">${label}</emb-button>`
};

export default meta;

export const Default = {};

export const Ghost = {
  args: {
    variant: "ghost"
  }
};
