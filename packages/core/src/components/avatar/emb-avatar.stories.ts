type AvatarStoryArgs = {
  alt: string;
  name: string;
  src: string;
};

const meta = {
  title: "Components/Avatar",
  args: {
    alt: "",
    name: "Ember Line",
    src: ""
  },
  render: ({ alt, name, src }: AvatarStoryArgs) =>
    `<emb-avatar ${alt ? `alt="${alt}"` : ""} ${name ? `name="${name}"` : ""} ${src ? `src="${src}"` : ""}></emb-avatar>`
};

export default meta;

export const Default = {};
