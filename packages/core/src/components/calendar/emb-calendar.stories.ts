type CalendarStoryArgs = {
  disabled: boolean;
  endValue: string;
  label: string;
  max: string;
  min: string;
  month: string;
  range: boolean;
  required: boolean;
  startValue: string;
  value: string;
};

const meta = {
  title: "Primitives/Calendar",
  args: {
    disabled: false,
    endValue: "2026-04-18",
    label: "Event date",
    max: "",
    min: "",
    month: "2026-04",
    range: false,
    required: false,
    startValue: "2026-04-12",
    value: "2026-04-26"
  },
  render: ({ disabled, endValue, label, max, min, month, range, required, startValue, value }: CalendarStoryArgs) => `
    <div style="display:grid;gap:8px;width:min(100%, ${range ? "680px" : "320px"});">
      <span>${label}</span>
      <emb-calendar
        aria-label="${label}"
        ${disabled ? "disabled" : ""}
        ${endValue ? `end-value="${endValue}"` : ""}
        ${max ? `max="${max}"` : ""}
        ${min ? `min="${min}"` : ""}
        ${month ? `month="${month}"` : ""}
        ${range ? "range" : ""}
        ${required ? "required" : ""}
        ${startValue ? `start-value="${startValue}"` : ""}
        ${value ? `value="${value}"` : ""}
      ></emb-calendar>
    </div>
  `
};

export default meta;

export const Default = {};

export const Range = {
  args: {
    label: "Vacation range",
    range: true,
    startValue: "2026-04-12",
    endValue: "2026-04-18",
    value: ""
  }
};
