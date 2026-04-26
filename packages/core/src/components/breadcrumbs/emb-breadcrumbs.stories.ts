type BreadcrumbsStoryArgs = {
  currentLabel: string;
  homeHref: string;
  homeLabel: string;
  sectionHref: string;
  sectionLabel: string;
};

const meta = {
  title: "Components/Breadcrumbs",
  args: {
    currentLabel: "Breadcrumbs",
    homeHref: "/",
    homeLabel: "Home",
    sectionHref: "/components",
    sectionLabel: "Components"
  },
  render: ({ currentLabel, homeHref, homeLabel, sectionHref, sectionLabel }: BreadcrumbsStoryArgs) => `
    <emb-breadcrumbs>
      <li><emb-link href="${homeHref}">${homeLabel}</emb-link></li>
      <li><emb-link href="${sectionHref}">${sectionLabel}</emb-link></li>
      <li aria-current="page">${currentLabel}</li>
    </emb-breadcrumbs>
  `
};

export default meta;

export const Default = {};
