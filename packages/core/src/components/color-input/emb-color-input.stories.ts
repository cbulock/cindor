type ColorInputStoryArgs = {
  disabled: boolean;
  label: string;
  value: string;
};

const meta = {
  title: "Primitives/Color Input",
  args: {
    disabled: false,
    label: "Accent color",
    value: "#4f46e5"
  },
  render: ({ disabled, label, value }: ColorInputStoryArgs) => `
    <div style="display:grid;gap:8px;width:min(100%, 160px);">
      <span>${label}</span>
      <emb-color-input
      aria-label="${label}"
      ${disabled ? "disabled" : ""}
      value="${value}"
      ></emb-color-input>
    </div>
  `
};

export default meta;

export const Default = {};
