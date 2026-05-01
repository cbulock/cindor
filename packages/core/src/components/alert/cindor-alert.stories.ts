type AlertStoryArgs = {
  message: string;
  title: string;
  tone: "info" | "success" | "warning" | "danger";
};

const meta = {
  title: "Components/Alert",
  args: {
    message: "The upstream Cindor tokens loaded successfully.",
    title: "Heads up",
    tone: "info"
  },
  argTypes: {
    tone: {
      control: "radio",
      options: ["info", "success", "warning", "danger"]
    }
  },
  render: ({ message, title, tone }: AlertStoryArgs) => `
    <cindor-alert tone="${tone}">
      <strong>${title}</strong>
      <span>${message}</span>
    </cindor-alert>
  `
};

export default meta;

export const Default = {};
