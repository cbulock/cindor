type SelectStoryArgs = {
  disabled: boolean;
  required: boolean;
  value: string;
};

const meta = {
  title: "Components/Select",
  args: {
    disabled: false,
    required: false,
    value: "open"
  },
  argTypes: {
    value: {
      control: "select",
      options: ["open", "in-progress", "closed"]
    }
  },
  render: ({ disabled, required, value }: SelectStoryArgs) => `
    <emb-select ${disabled ? "disabled" : ""} ${required ? "required" : ""} value="${value}">
      <option value="open">Open</option>
      <option value="in-progress">In progress</option>
      <option value="closed">Closed</option>
    </emb-select>
  `
};

export default meta;

export const Default = {};

export const Required = {
  args: {
    required: true
  }
};
