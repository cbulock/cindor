type LinkStoryArgs = {
  download: string;
  href: string;
  label: string;
  rel: string;
  target: string;
};

const meta = {
  title: "Primitives/Link",
  args: {
    download: "",
    href: "https://github.com/cbulock/cindor",
    label: "Repository",
    rel: "",
    target: "_blank"
  },
  render: ({ download, href, label, rel, target }: LinkStoryArgs) => `
    <cindor-link
      ${download ? `download="${download}"` : ""}
      href="${href}"
      ${rel ? `rel="${rel}"` : ""}
      ${target ? `target="${target}"` : ""}
    >${label}</cindor-link>
  `
};

export default meta;

export const Default = {};
