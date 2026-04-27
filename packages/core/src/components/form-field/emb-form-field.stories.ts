import { html } from "lit";

type FormFieldStoryArgs = {
  description: string;
  error: string;
  label: string;
  placeholder: string;
  required: boolean;
};

const meta = {
  title: "Composites/Form Field",
  args: {
    description: "We will use this address for account updates.",
    error: "",
    label: "Email address",
    placeholder: "name@example.com",
    required: true
  },
  render: ({ description, error, label, placeholder, required }: FormFieldStoryArgs) => html`
    <emb-form-field label=${label} description=${description} error=${error} ?required=${required}>
      <emb-email-input placeholder=${placeholder}></emb-email-input>
    </emb-form-field>
  `
};

export default meta;

export const Default = {};

export const WithError = {
  args: {
    error: "Enter a valid work email address."
  }
};
