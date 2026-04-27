type RadioStoryArgs = {
  checked: boolean;
  disabled: boolean;
  label: string;
  name: string;
  required: boolean;
  value: string;
};

const meta = {
  title: "Primitives/Radio",
  args: {
    checked: false,
    disabled: false,
    label: "Use compact density",
    name: "density",
    required: false,
    value: "compact"
  },
  render: ({ checked, disabled, label, name, required, value }: RadioStoryArgs) => `
    <emb-radio ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} name="${name}" ${required ? "required" : ""} value="${value}">
      ${label}
    </emb-radio>
  `
};

export default meta;

export const Default = {};

export const Checked = {
  args: {
    checked: true
  }
};
