type SwitchStoryArgs = {
  checked: boolean;
  disabled: boolean;
  label: string;
  required: boolean;
};

const meta = {
  title: "Primitives/Switch",
  args: {
    checked: false,
    disabled: false,
    label: "Enable compact mode",
    required: false
  },
  render: ({ checked, disabled, label, required }: SwitchStoryArgs) =>
    `<emb-switch ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} ${required ? "required" : ""}>${label}</emb-switch>`
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
