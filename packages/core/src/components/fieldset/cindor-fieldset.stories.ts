type FieldsetStoryArgs = {
  bioPlaceholder: string;
  disabled: boolean;
  inputPlaceholder: string;
  legend: string;
};

const meta = {
  title: "Primitives/Fieldset",
  args: {
    bioPlaceholder: "Bio",
    disabled: false,
    inputPlaceholder: "Display name",
    legend: "Profile"
  },
  render: ({ bioPlaceholder, disabled, inputPlaceholder, legend }: FieldsetStoryArgs) => `
    <cindor-fieldset ${disabled ? "disabled" : ""} legend="${legend}">
      <cindor-input placeholder="${inputPlaceholder}"></cindor-input>
      <cindor-textarea placeholder="${bioPlaceholder}"></cindor-textarea>
    </cindor-fieldset>
  `
};

export default meta;

export const Default = {};
