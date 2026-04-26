type DrawerStoryArgs = {
  content: string;
  heading: string;
  open: boolean;
  side: "start" | "end";
};

const meta = {
  title: "Components/Drawer",
  args: {
    content: "Drawers work well for settings, filters, and supporting detail views.",
    heading: "Panel title",
    open: true,
    side: "end"
  },
  argTypes: {
    side: {
      control: "radio",
      options: ["start", "end"]
    }
  },
  render: ({ content, heading, open, side }: DrawerStoryArgs) => `
    <emb-drawer ${open ? "open" : ""} side="${side}">
      <h3>${heading}</h3>
      <p>${content}</p>
    </emb-drawer>
  `
};

export default meta;

export const Default = {};
