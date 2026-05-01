type TagInputStoryArgs = {
  disabled: boolean;
  required: boolean;
};

const meta = {
  title: "Forms/Tag Input",
  args: {
    disabled: false,
    required: false
  },
  argTypes: {
    disabled: {
      control: "boolean"
    },
    required: {
      control: "boolean"
    }
  },
  render: ({ disabled, required }: TagInputStoryArgs) => `
    <cindor-tag-input aria-label="Labels" ${disabled ? "disabled" : ""} ${required ? "required" : ""} placeholder="Add labels"></cindor-tag-input>
  `
};

export default meta;

export const Default = {};
