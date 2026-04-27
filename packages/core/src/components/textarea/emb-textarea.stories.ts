type TextareaStoryArgs = {
  disabled: boolean;
  label: string;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  rows: number;
  value: string;
};

const meta = {
  title: "Primitives/Textarea",
  args: {
    disabled: false,
    label: "Release notes",
    placeholder: "Add release notes",
    readonly: false,
    required: false,
    rows: 4,
    value: ""
  },
  render: ({ disabled, label, placeholder, readonly, required, rows, value }: TextareaStoryArgs) =>
    `<div style="display:grid;gap:8px;width:min(100%, 420px);"><span id="textarea-story-label">${label}</span><emb-textarea aria-labelledby="textarea-story-label" ${disabled ? "disabled" : ""} placeholder="${placeholder}" ${readonly ? "readonly" : ""} ${required ? "required" : ""} rows="${rows}" value="${value}"></emb-textarea></div>`
};

export default meta;

export const Default = {};

export const Filled = {
  args: {
    value: "Native-first components aligned to Emberline tokens."
  }
};
