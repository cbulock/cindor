type DateInputStoryArgs = {
  disabled: boolean;
  label: string;
  max: string;
  min: string;
  readonly: boolean;
  required: boolean;
  value: string;
};

const meta = {
  title: "Primitives/Date Input",
  args: {
    disabled: false,
    label: "Publish date",
    max: "",
    min: "",
    readonly: false,
    required: false,
    value: "2026-04-26"
  },
  render: ({ disabled, label, max, min, readonly, required, value }: DateInputStoryArgs) => `
    <div style="display:grid;gap:8px;width:min(100%, 320px);">
      <span>${label}</span>
      <cindor-date-input
      aria-label="${label}"
      ${disabled ? "disabled" : ""}
      ${max ? `max="${max}"` : ""}
      ${min ? `min="${min}"` : ""}
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
      value="${value}"
      ></cindor-date-input>
    </div>
  `
};

export default meta;

export const Default = {};
