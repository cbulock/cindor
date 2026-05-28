type BannerStoryArgs = {
  dismissible: boolean;
  sticky: boolean;
  title: string;
  tone: "info" | "success" | "warning" | "danger";
};

const meta = {
  title: "Feedback/Banner",
  args: {
    dismissible: true,
    sticky: false,
    title: "Scheduled maintenance",
    tone: "info"
  },
  argTypes: {
    tone: {
      control: "radio",
      options: ["info", "success", "warning", "danger"]
    },
    dismissible: {
      control: "boolean"
    },
    sticky: {
      control: "boolean"
    }
  },
  render: ({ dismissible, sticky, title, tone }: BannerStoryArgs) => `
    <cindor-banner
      tone="${tone}"
      title="${title}"
      ${dismissible ? "dismissible" : ""}
      ${sticky ? "sticky" : ""}
    >
      <cindor-icon slot="icon" name="${tone === "success" ? "badge-check" : tone === "warning" ? "triangle-alert" : tone === "danger" ? "shield-alert" : "info"}"></cindor-icon>
      API deploys are paused from 8:00 PM to 9:00 PM Eastern while the database cluster is upgraded.
      <cindor-button slot="actions" variant="ghost">View status</cindor-button>
      <cindor-button slot="actions">Notify team</cindor-button>
    </cindor-banner>
  `
};

export default meta;

export const Default = {};

export const Success = {
  args: {
    dismissible: false,
    title: "Import complete",
    tone: "success"
  }
};

export const WarningSticky = {
  args: {
    sticky: true,
    title: "Deployment paused",
    tone: "warning"
  }
};
