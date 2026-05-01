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
    <cindor-multi-select aria-label="Team roles" ${disabled ? "disabled" : ""} ${open ? "open" : ""} ${required ? "required" : ""} placeholder="Choose team roles">
      <cindor-option selected value="designer">Designer</cindor-option>
      <cindor-option value="engineer">Engineer</cindor-option>
      <cindor-option value="pm">Product manager</cindor-option>
      <cindor-option value="support">Support</cindor-option>
    </cindor-multi-select>
  `
};

export default meta;

export const Default = {};
