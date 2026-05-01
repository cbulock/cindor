type FormRowStoryArgs = {
  columns: number;
};

const meta = {
  title: "Composites/Form Row",
  args: {
    columns: 2
  },
  render: ({ columns }: FormRowStoryArgs) => `
    <cindor-form-row columns="${columns}">
      <cindor-form-field label="First name">
        <cindor-input placeholder="Avery"></cindor-input>
      </cindor-form-field>
      <cindor-form-field label="Last name">
        <cindor-input placeholder="Morgan"></cindor-input>
      </cindor-form-field>
    </cindor-form-row>
  `
};

export default meta;

export const Default = {};
