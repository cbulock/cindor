type OptionStoryArgs = {
  active: boolean;
  disabled: boolean;
  label: string;
  selected: boolean;
  value: string;
};

const meta = {
  title: "Primitives/Option",
  args: {
    active: false,
    disabled: false,
    label: "Alpha",
    selected: false,
    value: "alpha"
  },
  render: ({ active, disabled, label, selected, value }: OptionStoryArgs) => `
    <emb-listbox style="width:min(100%, 320px);">
      <emb-option
        value="${value}"
        ${active ? "active" : ""}
        ${disabled ? "disabled" : ""}
        ${selected ? "selected" : ""}
      >${label}</emb-option>
    </emb-listbox>
  `
};

export default meta;

export const Default = {};
