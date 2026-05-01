type TagStoryArgs = {
  dismissible: boolean;
  label: string;
  tone: "neutral" | "accent" | "success";
};

const meta = {
  title: "Primitives/Tag",
  args: {
    dismissible: false,
    label: "Critical",
    tone: "accent"
  },
  argTypes: {
    dismissible: {
      control: "boolean"
    },
    tone: {
      control: "radio",
      options: ["neutral", "accent", "success"]
    }
  },
  render: ({ dismissible, label, tone }: TagStoryArgs) =>
    `<cindor-tag tone="${tone}" ${dismissible ? "dismissible" : ""}>${label}</cindor-tag>`
};

export default meta;

export const Default = {};

export const Dismissible = {
  args: {
    dismissible: true,
    label: "Backend"
  }
};
