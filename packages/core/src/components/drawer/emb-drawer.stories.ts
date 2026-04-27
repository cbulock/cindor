import { html } from "lit";

type DrawerStoryArgs = {
  content: string;
  heading: string;
  open: boolean;
  side: "start" | "end";
};

const meta = {
  title: "Composites/Drawer",
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
  render: ({ content, heading, open, side }: DrawerStoryArgs) => html`
    <emb-drawer .open=${open} side="${side}" aria-labelledby="drawer-title" aria-describedby="drawer-description">
      <h3 id="drawer-title">${heading}</h3>
      <p id="drawer-description">${content}</p>
    </emb-drawer>
  `
};

export default meta;

export const Default = {};
