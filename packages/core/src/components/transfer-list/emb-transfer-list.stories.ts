type TransferListStoryArgs = {
  disabled: boolean;
  required: boolean;
};

const meta = {
  title: "Selection/Transfer List",
  args: {
    disabled: false,
    required: false
  },
  argTypes: {
    disabled: {
      control: "boolean"
    },
    required: {
      control: "boolean"
    }
  },
  render: ({ disabled, required }: TransferListStoryArgs) => `
    <emb-transfer-list ${disabled ? "disabled" : ""} ${required ? "required" : ""}>
      <option value="design">Design</option>
      <option value="engineering" selected>Engineering</option>
      <option value="product">Product</option>
      <option value="support">Support</option>
    </emb-transfer-list>
  `
};

export default meta;

export const Default = {};
