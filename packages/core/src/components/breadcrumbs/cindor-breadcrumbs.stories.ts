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
    <cindor-breadcrumbs>
      <li><cindor-link href="${homeHref}">${homeLabel}</cindor-link></li>
      <li><cindor-link href="${sectionHref}">${sectionLabel}</cindor-link></li>
      <li aria-current="page">${currentLabel}</li>
    </cindor-breadcrumbs>
  `
};

export default meta;

export const Default = {};
