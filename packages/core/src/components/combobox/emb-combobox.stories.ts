type ComboboxStoryArgs = {
  autocomplete: string;
  disabled: boolean;
  optionOne: string;
  optionThree: string;
  optionTwo: string;
  placeholder: string;
  readonly: boolean;
  required: boolean;
  value: string;
};

const meta = {
  title: "Components/Combobox",
  args: {
    autocomplete: "",
    disabled: false,
    optionOne: "Web Components",
    optionThree: "Vue",
    optionTwo: "React",
    placeholder: "Choose a framework",
    readonly: false,
    required: false,
    value: ""
  },
  render: ({
    autocomplete,
    disabled,
    optionOne,
    optionThree,
    optionTwo,
    placeholder,
    readonly,
    required,
    value
  }: ComboboxStoryArgs) => `
    <emb-combobox
      ${autocomplete ? `autocomplete="${autocomplete}"` : ""}
      ${disabled ? "disabled" : ""}
      ${readonly ? "readonly" : ""}
      ${required ? "required" : ""}
      placeholder="${placeholder}"
      value="${value}"
    >
      <option value="${optionOne}">${optionOne}</option>
      <option value="${optionTwo}">${optionTwo}</option>
      <option value="${optionThree}">${optionThree}</option>
    </emb-combobox>
  `
};

export default meta;

export const Default = {};
