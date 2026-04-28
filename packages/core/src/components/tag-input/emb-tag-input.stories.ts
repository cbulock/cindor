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
    <emb-tag-input ${disabled ? "disabled" : ""} ${required ? "required" : ""} placeholder="Add labels"></emb-tag-input>
  `
};

export default meta;

export const Default = {};
