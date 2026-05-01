import { html } from "lit";

import type { CommandPaletteCommand } from "./cindor-command-palette.js";

type CommandPaletteStoryArgs = {
  open: boolean;
  title: string;
};

const commands: CommandPaletteCommand[] = [
  { description: "Create a new project draft", keywords: ["create", "new"], label: "New project", shortcut: "N", value: "new-project" },
  { description: "Jump to the releases view", keywords: ["deployments", "versions"], label: "Open releases", shortcut: "G R", value: "open-releases" },
  { description: "Invite a teammate to the workspace", keywords: ["users", "members"], label: "Invite teammate", shortcut: "I", value: "invite-teammate" }
];

const meta = {
  title: "Components/Command Palette",
  args: {
    open: true,
    title: "Workspace commands"
  },
  render: ({ open, title }: CommandPaletteStoryArgs) => html`
    <cindor-command-palette
      .commands=${commands}
      ?open=${open}
      title=${title}
    ></cindor-command-palette>
  `
};

export default meta;

export const Default = {};
