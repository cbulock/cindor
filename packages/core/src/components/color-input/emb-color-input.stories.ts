type ColorInputStoryArgs = {
  disabled: boolean;
  value: string;
};

const meta = {
  title: "Components/Color Input",
  args: {
    disabled: false,
    value: "#4f46e5"
  },
  render: ({ disabled, value }: ColorInputStoryArgs) => `
    <emb-color-input
      ${disabled ? "disabled" : ""}
      value="${value}"
    ></emb-color-input>
  `
};

export default meta;

export const Default = {};
