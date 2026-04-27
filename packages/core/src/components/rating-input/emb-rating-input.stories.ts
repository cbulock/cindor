import { html } from "lit";

type RatingInputStoryArgs = {
  clearable: boolean;
  max: number;
  value: number;
};

const meta = {
  title: "Components/Rating Input",
  args: {
    clearable: true,
    max: 5,
    value: 3
  },
  render: ({ clearable, max, value }: RatingInputStoryArgs) => html`
    <emb-rating-input aria-label="Satisfaction rating" ?clearable=${clearable} .max=${max} .value=${value}></emb-rating-input>
  `
};

export default meta;

export const Default = {};
