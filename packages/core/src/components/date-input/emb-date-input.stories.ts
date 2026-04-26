type DateInputStoryArgs = {
  disabled: boolean;
  max: string;
  min: string;
  readonly: boolean;
  required: boolean;
  value: string;
};

const meta = {
  title: "Components/Date Input",
  args: {
    disabled: false,
    max: "",
    min: "",
    readonly: false,
    required: false,
    value: "2026-04-26"
  },
  render: ({ disabled, max, min, readonly, required, value }: DateInputStoryArgs) => `
    <emb-date-input
      ${disabled ? "disabled" : ""}
      ${max ? `max="${max}"` : ""}
      ${min ? `min="${min}"` : ""}
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
      value="${value}"
    ></emb-date-input>
  `
};

export default meta;

export const Default = {};
