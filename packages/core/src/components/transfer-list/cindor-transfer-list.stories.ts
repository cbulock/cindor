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
    <cindor-transfer-list available-label="Available reviewers" selected-label="Release approvers" ${disabled ? "disabled" : ""} ${required ? "required" : ""}>
      <option value="design">Design review</option>
      <option value="engineering" selected>Engineering lead</option>
      <option value="product">Product owner</option>
      <option value="support">Support readiness</option>
    </cindor-transfer-list>
  `
};

export default meta;

export const Default = {};
