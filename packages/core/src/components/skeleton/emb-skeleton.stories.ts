type SkeletonStoryArgs = {
  height: string;
  size: string;
  variant: "line" | "block" | "circle";
  width: string;
};

const meta = {
  title: "Components/Skeleton",
  parameters: {
    layout: "padded"
  },
  args: {
    height: "1rem",
    size: "2.5rem",
    variant: "line",
    width: "100%"
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["line", "block", "circle"]
    }
  },
  render: ({ height, size, variant, width }: SkeletonStoryArgs) => `
    <div style="display:grid;gap:12px;width:min(320px, calc(100vw - 2rem));max-width:100%;">
      <emb-skeleton
        variant="${variant}"
        style="--emb-skeleton-height:${height};--emb-skeleton-size:${size};--emb-skeleton-width:${width};"
      ></emb-skeleton>
    </div>
  `
};

export default meta;

export const Playground = {};

export const Default = {
  ...Playground
};

export const Showcase = {
  render: ({ height, size, width }: Omit<SkeletonStoryArgs, "variant">) => `
    <div style="display:grid;gap:16px;width:min(320px, calc(100vw - 2rem));max-width:100%;">
      <div style="display:grid;gap:8px;">
        <span style="font:600 0.875rem/1.2 sans-serif;color:var(--fg-muted);">Line</span>
        <emb-skeleton
          variant="line"
          style="--emb-skeleton-height:${height};--emb-skeleton-width:${width};"
        ></emb-skeleton>
      </div>
      <div style="display:grid;gap:8px;">
        <span style="font:600 0.875rem/1.2 sans-serif;color:var(--fg-muted);">Block</span>
        <emb-skeleton
          variant="block"
          style="--emb-skeleton-height:${height};--emb-skeleton-width:${width};"
        ></emb-skeleton>
      </div>
      <div style="display:grid;gap:8px;">
        <span style="font:600 0.875rem/1.2 sans-serif;color:var(--fg-muted);">Circle</span>
        <emb-skeleton
          variant="circle"
          style="--emb-skeleton-size:${size};"
        ></emb-skeleton>
      </div>
    </div>
  `
};

export const Line = {
  args: {
    variant: "line"
  }
};

export const Block = {
  args: {
    variant: "block",
    height: "4rem"
  }
};

export const Circle = {
  args: {
    variant: "circle",
    width: "2.5rem"
  }
};
