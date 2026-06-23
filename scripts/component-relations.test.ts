import { describe, expect, it } from "vitest";

import { componentCatalog, getComponentDoc } from "../apps/docs/src/catalog.js";
import { getRelatedComponents } from "../apps/docs/src/component-relations.js";

describe("getRelatedComponents", () => {
  it("prefers direct family components over loose category matches", () => {
    const timeline = getComponentDoc("timeline");
    expect(timeline).toBeDefined();

    const related = getRelatedComponents(timeline!, componentCatalog);

    expect(related.map((component) => component.slug)).toContain("timeline-item");
    expect(related[0]?.slug).toBe("timeline-item");
  });

  it("connects shared component families that use different suffixes", () => {
    const descriptionList = getComponentDoc("description-list");
    expect(descriptionList).toBeDefined();

    const related = getRelatedComponents(descriptionList!, componentCatalog);

    expect(related.map((component) => component.slug)).toContain("description-item");
  });

  it("still falls back to broader relatedness when no direct family exists", () => {
    const search = getComponentDoc("search");
    expect(search).toBeDefined();

    const related = getRelatedComponents(search!, componentCatalog);

    expect(related.length).toBeGreaterThan(0);
    expect(related.some((component) => component.slug === "empty-search-results")).toBe(true);
  });
});
