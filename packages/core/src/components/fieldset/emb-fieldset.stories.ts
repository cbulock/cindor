type FieldsetStoryArgs = {
  bioPlaceholder: string;
  disabled: boolean;
  inputPlaceholder: string;
  legend: string;
};

const meta = {
  title: "Components/Fieldset",
  args: {
    bioPlaceholder: "Bio",
    disabled: false,
    inputPlaceholder: "Display name",
    legend: "Profile"
  },
  render: ({ bioPlaceholder, disabled, inputPlaceholder, legend }: FieldsetStoryArgs) => `
    <emb-fieldset ${disabled ? "disabled" : ""} legend="${legend}">
      <emb-input placeholder="${inputPlaceholder}"></emb-input>
      <emb-textarea placeholder="${bioPlaceholder}"></emb-textarea>
    </emb-fieldset>
  `
};

export default meta;

export const Default = {};
