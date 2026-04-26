type IconStoryArgs = {
  label: string;
  name:
    | "check"
    | "chevron-down"
    | "chevron-left"
    | "chevron-right"
    | "circle-alert"
    | "external-link"
    | "info"
    | "minus"
    | "plus"
    | "search"
    | "upload"
    | "x";
  size: number;
  strokeWidth: number;
};

const meta = {
  title: "Components/Icon",
  args: {
    label: "Search",
    name: "search",
    size: 20,
    strokeWidth: 2
  },
  argTypes: {
    name: {
      control: "select",
      options: ["check", "chevron-down", "chevron-left", "chevron-right", "circle-alert", "external-link", "info", "minus", "plus", "search", "upload", "x"]
    }
  },
  render: ({ label, name, size, strokeWidth }: IconStoryArgs) =>
    `<emb-icon label="${label}" name="${name}" size="${size}" stroke-width="${strokeWidth}"></emb-icon>`
};

export default meta;

export const Default = {};
