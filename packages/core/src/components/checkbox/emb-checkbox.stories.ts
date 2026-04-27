type CheckboxStoryArgs = {
  checked: boolean;
  disabled: boolean;
  label: string;
  required: boolean;
};

const meta = {
  title: "Primitives/Checkbox",
  args: {
    checked: false,
    disabled: false,
    label: "Remember selection",
    required: false
  },
  render: ({ checked, disabled, label, required }: CheckboxStoryArgs) =>
    `<emb-checkbox ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} ${required ? "required" : ""}>${label}</emb-checkbox>`
};

export default meta;

export const Default = {};

export const Checked = {
  args: {
    checked: true
  }
};

export const Required = {
  args: {
    required: true
  }
};
