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
  title: "Primitives/Icon",
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
    `<cindor-icon label="${label}" name="${name}" size="${size}" stroke-width="${strokeWidth}"></cindor-icon>`
};

export default meta;

export const Default = {};
