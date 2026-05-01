type SelectStoryArgs = {
  disabled: boolean;
  label: string;
  required: boolean;
  value: string;
};

const meta = {
  title: "Primitives/Select",
  args: {
    disabled: false,
    label: "Status",
    required: false,
    value: "open"
  },
  argTypes: {
    value: {
      control: "select",
      options: ["open", "in-progress", "closed"]
    }
  },
  render: ({ disabled, label, required, value }: SelectStoryArgs) => `
    <div style="display:grid;gap:8px;width:min(100%, 320px);">
      <span>${label}</span>
      <cindor-select aria-label="${label}" ${disabled ? "disabled" : ""} ${required ? "required" : ""} value="${value}">
      <option value="open">Open</option>
      <option value="in-progress">In progress</option>
      <option value="closed">Closed</option>
      </cindor-select>
    </div>
  `
};

export default meta;

export const Default = {};

export const Required = {
  args: {
    required: true
  }
};
