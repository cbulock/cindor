type LinkStoryArgs = {
  download: string;
  href: string;
  label: string;
  rel: string;
  target: string;
};

const meta = {
  title: "Components/Link",
  args: {
    download: "",
    href: "https://github.com/cbulock/emberline-components",
    label: "Repository",
    rel: "",
    target: "_blank"
  },
  render: ({ download, href, label, rel, target }: LinkStoryArgs) => `
    <emb-link
      ${download ? `download="${download}"` : ""}
      href="${href}"
      ${rel ? `rel="${rel}"` : ""}
      ${target ? `target="${target}"` : ""}
    >${label}</emb-link>
  `
};

export default meta;

export const Default = {};
