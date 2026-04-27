type ToastRegionStoryArgs = {
  firstTone: "neutral" | "success" | "warning" | "danger";
  placement: "top-start" | "top-end" | "bottom-start" | "bottom-end";
  secondTone: "neutral" | "success" | "warning" | "danger";
};

const meta = {
  title: "Composites/Toast Region",
  args: {
    firstTone: "success",
    placement: "top-end",
    secondTone: "warning"
  },
  argTypes: {
    firstTone: {
      control: "radio",
      options: ["neutral", "success", "warning", "danger"]
    },
    placement: {
      control: "radio",
      options: ["top-start", "top-end", "bottom-start", "bottom-end"]
    },
    secondTone: {
      control: "radio",
      options: ["neutral", "success", "warning", "danger"]
    }
  },
  render: ({ firstTone, placement, secondTone }: ToastRegionStoryArgs) => `
    <div style="min-height: 16rem; position: relative;">
      <emb-toast-region placement="${placement}">
        <emb-toast dismissible tone="${firstTone}">
          <span>Changes saved to the design token layer.</span>
        </emb-toast>
        <emb-toast dismissible tone="${secondTone}">
          <span>Theme settings were updated successfully.</span>
        </emb-toast>
      </emb-toast-region>
    </div>
  `
};

export default meta;

export const Default = {};
