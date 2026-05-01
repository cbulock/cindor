type MultiSelectStoryArgs = {
  disabled: boolean;
  open: boolean;
  required: boolean;
};

const meta = {
  title: "Selection/Multi Select",
  args: {
    disabled: false,
    open: false,
    required: false
  },
  argTypes: {
    disabled: {
      control: "boolean"
    },
    open: {
      control: "boolean"
    },
    required: {
      control: "boolean"
    }
  },
  render: ({ disabled, open, required }: MultiSelectStoryArgs) => `
    <emb-multi-select aria-label="Team roles" ${disabled ? "disabled" : ""} ${open ? "open" : ""} ${required ? "required" : ""} placeholder="Choose team roles">
      <emb-option selected value="designer">Designer</emb-option>
      <emb-option value="engineer">Engineer</emb-option>
      <emb-option value="pm">Product manager</emb-option>
      <emb-option value="support">Support</emb-option>
    </emb-multi-select>
  `
};

export default meta;

export const Default = {};
