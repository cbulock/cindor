import { docsRouteComponentSlugs, previewDependencySlugs } from "./route-registration-data.js";

const componentModules = import.meta.glob<Record<string, unknown>>([
  "../../../packages/core/src/components/*/cindor-*.ts",
  "!../../../packages/core/src/components/*/*.stories.ts",
  "!../../../packages/core/src/components/*/*.test.ts"
]);

const registeredComponentSlugs = new Set<string>();
const previewRegisteredSlugs = new Set<string>();
const componentRegistrationPromises = new Map<string, Promise<void>>();
let docsRouteRegistrationPromise: Promise<void> | null = null;
const componentSlugPattern = /^[a-z][a-z0-9-]*$/u;

export function isDocsRouteRegistered(): boolean {
  return docsRouteRegistrationPromise !== null && docsRouteComponentSlugs.every((slug) => registeredComponentSlugs.has(slug));
}

export function isComponentPreviewRegistered(slug: string): boolean {
  return previewRegisteredSlugs.has(slug);
}

export async function ensureDocsRouteRegistered(): Promise<void> {
  if (isDocsRouteRegistered()) {
    return;
  }

  docsRouteRegistrationPromise ??= Promise.all(docsRouteComponentSlugs.map((slug) => ensureComponentRegistered(slug)))
    .then(() => undefined)
    .catch((error) => {
      docsRouteRegistrationPromise = null;
      throw error;
    });
  await docsRouteRegistrationPromise;
}

export async function ensureComponentPreviewRegistered(slug: string): Promise<void> {
  if (previewRegisteredSlugs.has(slug)) {
    return;
  }

  await ensureDocsRouteRegistered();

  const requiredSlugs = new Set<string>([slug, ...(previewDependencySlugs[slug] ?? [])]);
  await Promise.all(Array.from(requiredSlugs).map((componentSlug) => ensureComponentRegistered(componentSlug)));
  previewRegisteredSlugs.add(slug);
}

function ensureComponentRegistered(slug: string): Promise<void> {
  if (registeredComponentSlugs.has(slug)) {
    return Promise.resolve();
  }

  const existingPromise = componentRegistrationPromises.get(slug);
  if (existingPromise) {
    return existingPromise;
  }

  const registrationPromise = registerComponent(slug)
    .then(() => {
      registeredComponentSlugs.add(slug);
    })
    .catch((error) => {
      componentRegistrationPromises.delete(slug);
      throw error;
    });

  componentRegistrationPromises.set(slug, registrationPromise);
  return registrationPromise;
}

async function registerComponent(slug: string): Promise<void> {
  if (!componentSlugPattern.test(slug)) {
    throw new Error(`Invalid component slug "${slug}".`);
  }

  const tagName = `cindor-${slug}`;
  if (customElements.get(tagName)) {
    return;
  }

  if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
    throw new Error(`Invalid component slug format: "${slug}".`);
  }

  const modulePath = `../../../packages/core/src/components/${slug}/cindor-${slug}.ts`;
  const loadModule = componentModules[modulePath];

  if (!loadModule) {
    throw new Error(`Missing docs component module for slug "${slug}".`);
  }

  const moduleExports = await loadModule();
  const exportName = toExportName(slug);
  const componentClass = moduleExports[exportName];

  if (!(componentClass instanceof Function)) {
    throw new Error(`Module "${modulePath}" does not export "${exportName}".`);
  }

  if (!customElements.get(tagName)) {
    customElements.define(tagName, componentClass as CustomElementConstructor);
  }
}

function toExportName(slug: string): string {
  const pascalName = slug
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");

  return `Cindor${pascalName}`;
}
