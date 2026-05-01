type FormRowStoryArgs = {
  columns: number;
};

const meta = {
  title: "Composites/Form Row",
  args: {
    columns: 2
  },
  render: ({ columns }: FormRowStoryArgs) => `
    <emb-form-row columns="${columns}">
      <emb-form-field label="First name">
        <emb-input placeholder="Avery"></emb-input>
      </emb-form-field>
      <emb-form-field label="Last name">
        <emb-input placeholder="Morgan"></emb-input>
      </emb-form-field>
    </emb-form-row>
  `
};

export default meta;

export const Default = {};
