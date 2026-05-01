type AvatarStoryArgs = {
  alt: string;
  name: string;
  src: string;
};

const meta = {
  title: "Components/Avatar",
  args: {
    alt: "",
    name: "Cindor Line",
    src: ""
  },
  render: ({ alt, name, src }: AvatarStoryArgs) =>
    `<cindor-avatar ${alt ? `alt="${alt}"` : ""} ${name ? `name="${name}"` : ""} ${src ? `src="${src}"` : ""}></cindor-avatar>`
};

export default meta;

export const Default = {};
