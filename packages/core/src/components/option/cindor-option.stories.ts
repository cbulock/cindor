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
    <cindor-listbox aria-label="Greek letter selection" style="width:min(100%, 320px);">
      <cindor-option
        value="${value}"
        ${active ? "active" : ""}
        ${disabled ? "disabled" : ""}
        ${selected ? "selected" : ""}
      >${label}</cindor-option>
    </cindor-listbox>
  `
};

export default meta;

export const Default = {};
