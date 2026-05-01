type IconButtonStoryArgs = {
  disabled: boolean;
  label: string;
  name: string;
};

const meta = {
  title: "Primitives/Icon Button",
  args: {
    disabled: false,
    label: "Close dialog",
    name: "x"
  },
  render: ({ disabled, label, name }: IconButtonStoryArgs) =>
    `<cindor-icon-button ${disabled ? "disabled" : ""} label="${label}" name="${name}"></cindor-icon-button>`
};

export default meta;

export const Default = {};
