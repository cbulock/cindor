type TextareaStoryArgs = {
  disabled: boolean;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  rows: number;
  value: string;
};

const meta = {
  title: "Components/Textarea",
  args: {
    disabled: false,
    placeholder: "Add release notes",
    readonly: false,
    required: false,
    rows: 4,
    value: ""
  },
  render: ({ disabled, placeholder, readonly, required, rows, value }: TextareaStoryArgs) =>
    `<emb-textarea ${disabled ? "disabled" : ""} placeholder="${placeholder}" ${readonly ? "readonly" : ""} ${required ? "required" : ""} rows="${rows}" value="${value}"></emb-textarea>`
};

export default meta;

export const Default = {};

export const Filled = {
  args: {
    value: "Native-first components aligned to Emberline tokens."
  }
};
