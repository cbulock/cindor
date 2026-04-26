type FileInputStoryArgs = {
  accept: string;
  disabled: boolean;
  multiple: boolean;
  required: boolean;
};

const meta = {
  title: "Components/File Input",
  args: {
    accept: ".png,.jpg",
    disabled: false,
    multiple: true,
    required: false
  },
  render: ({ accept, disabled, multiple, required }: FileInputStoryArgs) => `
    <emb-file-input
      ${accept ? `accept="${accept}"` : ""}
      ${disabled ? "disabled" : ""}
      ${multiple ? "multiple" : ""}
      ${required ? "required" : ""}
    ></emb-file-input>
  `
};

export default meta;

export const Default = {};
