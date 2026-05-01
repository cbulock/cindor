type ToastStoryArgs = {
  dismissible: boolean;
  message: string;
  open: boolean;
  tone: "neutral" | "success" | "warning" | "danger";
};

const meta = {
  title: "Components/Toast",
  args: {
    dismissible: true,
    message: "Changes saved to the design token layer.",
    open: true,
    tone: "neutral"
  },
  argTypes: {
    tone: {
      control: "radio",
      options: ["neutral", "success", "warning", "danger"]
    }
  },
  render: ({ dismissible, message, open, tone }: ToastStoryArgs) => `
    <cindor-toast ${dismissible ? "dismissible" : ""} ${open ? "open" : ""} tone="${tone}">
      <span>${message}</span>
    </cindor-toast>
  `
};

export default meta;

export const Default = {};
