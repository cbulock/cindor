import "emberline-ui-core/register";
import "emberline-ui-core/styles.css";
import "./app.css";
import componentDocsData from "../../../packages/core/component-docs.json";

import type { CommandPaletteCommand, SegmentedControlOption, StepperStep } from "emberline-ui-core";

import {
  componentCatalog,
  componentLayerOptions,
  getComponentDoc,
  type ComponentCategory,
  type ComponentDoc,
  type ComponentLayerFilter
} from "./catalog.js";

type AlertTone = "info" | "success" | "warning" | "danger";

type DocsSection = {
  id: string;
  summary: string;
  title: string;
};

type Route =
  | {
      kind: "component";
      slug: string;
    }
  | {
      kind: "home";
      sectionId: string;
    };

type CommandPaletteHost = HTMLElement & {
  commands: CommandPaletteCommand[];
  show: () => void;
};

type SearchHost = HTMLElement & {
  value: string;
};

type SegmentedControlHost = HTMLElement & {
  options: SegmentedControlOption[];
  value: string;
};

type StepperHost = HTMLElement & {
  steps: StepperStep[];
  value: string;
};

type ApiItem = {
  attributeName?: string | null;
  defaultValue?: string;
  detail: string;
  name: string;
  type?: string;
  values?: string;
};

type ApiGroup = {
  empty: string;
  items: ApiItem[];
  title: string;
};

type ComponentApiSurface = {
  groups: ApiGroup[];
  intro: string;
};

type ApiItemOptions = Omit<ApiItem, "detail" | "name">;

type GeneratedComponentProperty = {
  attributeName: string | null;
  defaultValue: string | null;
  description: string;
  name: string;
  reflects: boolean;
  type: string | null;
  values: string[] | null;
};

type GeneratedComponentMethod = {
  description: string;
  name: string;
  parameters: Array<{
    name: string;
    optional: boolean;
    type: string | null;
  }>;
  returnType: string | null;
};

type GeneratedComponentEvent = {
  description: string;
  name: string;
  type: string | null;
  values: string[] | null;
};

type GeneratedComponentSlot = {
  description: string;
  name: string;
};

type GeneratedComponentDoc = {
  className: string;
  description: string;
  events: GeneratedComponentEvent[];
  methods: GeneratedComponentMethod[];
  modulePath: string;
  properties: GeneratedComponentProperty[];
  slots: GeneratedComponentSlot[];
  summary: string;
  tagName: string;
};

type GeneratedComponentDocs = {
  components: GeneratedComponentDoc[];
};

const sections: DocsSection[] = [
  {
    id: "overview",
    summary: "Repository overview and the main technical constraints of the library.",
    title: "Overview"
  },
  {
    id: "getting-started",
    summary: "Install, register, theme, and render components in any web app.",
    title: "Getting started"
  },
  {
    id: "components",
    summary: "Browse the full component inventory and jump into per-component docs.",
    title: "Components"
  },
  {
    id: "patterns",
    summary: "Higher-level workflows and interaction patterns built from primitives.",
    title: "Patterns"
  }
];

const setupSteps: StepperStep[] = [
  { description: "Install the package and import the shared global styles.", label: "Install", value: "install" },
  { description: "Register the custom elements once in your app bootstrap.", label: "Register", value: "register" },
  { description: "Compose primitives and composites in any standard web component consumer.", label: "Compose", value: "compose" }
];

const alertToneOptions: SegmentedControlOption[] = [
  { label: "Info", value: "info" },
  { label: "Success", value: "success" },
  { label: "Warning", value: "warning" },
  { label: "Danger", value: "danger" }
];

const catalogLayerFilterOptions: SegmentedControlOption[] = componentLayerOptions
  .map((option) => ({ label: option === "all" ? "All" : option, value: option }));

const quickStartCode = `import "emberline-ui-core/styles.css";
import "emberline-ui-core/register";

const form = document.querySelector("form");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
});`;

const installCode = `npm install emberline-ui-core`;
const reactInstallCode = `npm install emberline-ui-core emberline-ui-react`;
const vueInstallCode = `npm install emberline-ui-core emberline-ui-vue`;
const reactQuickStartCode = `import "emberline-ui-core/styles.css";
import { EmbButton } from "emberline-ui-react";

export function App() {
  return <EmbButton>Save changes</EmbButton>;
}`;
const vueQuickStartCode = `<script setup lang="ts">
import "emberline-ui-core/styles.css";
import { EmbButton } from "emberline-ui-vue";
</script>

<template>
  <EmbButton>Save changes</EmbButton>
</template>`;

const dataTableSampleRows = [
  { id: "1", component: "emb-button", layer: "Primitive", use: "Actions" },
  { id: "2", component: "emb-form-field", layer: "Composite", use: "Forms" },
  { id: "3", component: "emb-command-palette", layer: "Component", use: "Workflows" }
];

const stepperDetailSteps: StepperStep[] = [
  { description: "Capture the flow state.", label: "Draft", value: "draft" },
  { description: "Collect user input or approvals.", label: "Review", value: "review" },
  { description: "Finish the workflow with a clear status.", label: "Launch", value: "launch" }
];

const segmentedDemoOptions: SegmentedControlOption[] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" }
];

const generatedComponentDocs = componentDocsData as GeneratedComponentDocs;
const componentDocsByTag = new Map(generatedComponentDocs.components.map((component) => [component.tagName, component] as const));

const rootElement = document.querySelector<HTMLDivElement>("#app");

if (!rootElement) {
  throw new Error("Expected #app root element.");
}

const root = rootElement;

let activeAlertTone: AlertTone = "info";
let catalogQuery = "";
let catalogLayer: ComponentLayerFilter = "all";

render();

window.addEventListener("hashchange", () => {
  render();
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openPalette();
  }
});

function render(): void {
  const route = getRoute();
  const activeSectionId = route.kind === "component" ? "components" : route.sectionId;
  const content = route.kind === "component" ? renderComponentDetail(route.slug) : renderHome(route.sectionId);

  root.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        ${renderSidebar(activeSectionId, route)}
      </aside>

      <main class="main">
        ${content}
        <footer class="footer">
          Kept in-repo so docs, stories, and package APIs stay aligned.
        </footer>
      </main>
    </div>

    <emb-command-palette id="docs-command-palette" title="Emberline docs"></emb-command-palette>
  `;

  wireNavigation();
  hydrateLivingExamples(route);
  syncRouteScroll(route);
}

function renderSidebar(activeSectionId: string, route: Route): string {
  const currentComponent = route.kind === "component" ? getComponentDoc(route.slug) : undefined;

  return `
    <div class="brand">
      <div class="brand-copy">
        <strong>Emberline UI docs</strong>
        <span class="eyebrow">Technical reference for the Emberline component library.</span>
      </div>
    </div>

    <nav class="sidebar-nav" aria-label="Documentation sections">
      ${sections
        .map(
          (section) => `
            <a class="nav-link" data-active="${String(section.id === activeSectionId)}" href="#${section.id}">
              <span class="nav-title">${section.title}</span>
              <span class="nav-summary">${section.summary}</span>
            </a>
          `
        )
        .join("")}
    </nav>

    <div class="sidebar-stats">
      <emb-card>
        <div class="card-body">
          <strong>${componentCatalog.length} documented components</strong>
          <p class="muted">The docs catalog mirrors the current registered Emberline component surface.</p>
        </div>
      </emb-card>
    </div>

    ${
      currentComponent
        ? `
          <div class="sidebar-current">
            <div class="sidebar-section-label">Current component</div>
            <a class="nav-link" data-active="true" href="#components/${currentComponent.slug}">
              <span class="nav-title">${currentComponent.title}</span>
              <span class="nav-summary">${currentComponent.summary}</span>
            </a>
          </div>
        `
        : ""
    }

    <div class="sidebar-footer">
      <emb-button data-action="open-palette" variant="ghost">Open command palette</emb-button>
      <emb-alert tone="info">
        This site imports the same emberline-ui-core source surfaces consumers use.
      </emb-alert>
    </div>
  `;
}

function renderHome(activeSectionId: string): string {
  return `
    <section class="hero" id="overview">
      <div class="hero-copy">
        <emb-breadcrumbs>
          <a href="#overview">Emberline UI</a>
          <a href="#getting-started">Documentation</a>
        </emb-breadcrumbs>
        <h1 class="hero-title">Emberline UI technical reference.</h1>
        <p class="muted">
          Emberline UI keeps behavior in a standards-based custom element core and exposes thin React and Vue adapters. This docs app uses the web-component layer directly so examples stay close to the primary integration surface.
        </p>
      </div>

      <div class="hero-actions">
        <emb-button data-target-section="getting-started">Installation</emb-button>
        <emb-button variant="ghost" data-target-section="components">Component catalog</emb-button>
        <emb-button variant="ghost" data-target-section="patterns">Composition patterns</emb-button>
      </div>

      <div class="card-grid">
        <emb-card>
          <div class="card-body">
            <h3>Native-first primitives</h3>
            <p class="muted">Prefer platform elements where they fit: buttons, inputs, selects, textareas, dialog, tables, and form semantics.</p>
          </div>
        </emb-card>
        <emb-card>
          <div class="card-body">
            <h3>Stable integration surface</h3>
            <p class="muted">Consumers work with attributes, properties, slots, composed events, and CSS custom properties instead of framework-only APIs.</p>
          </div>
        </emb-card>
        <emb-card>
          <div class="card-body">
            <h3>Complete component reference</h3>
            <p class="muted">Each registered component has a dedicated docs route with usage snippets, facts, and component-specific notes.</p>
          </div>
        </emb-card>
      </div>
    </section>

    <div class="content-grid">
      <section class="section" id="getting-started" data-active-section="${String(activeSectionId === "getting-started")}">
        <div class="section-heading">
          <h2>Getting started</h2>
          <p>Start with the core web components directly or consume the same surface through the thin React and Vue adapters.</p>
        </div>

        <div class="install-grid">
          <div class="preview-block">
            <strong>Web components</strong>
            <p class="muted">Use the core package when you want the standards-based custom elements directly in any app that supports them.</p>
            <emb-code-block code="${escapeAttribute(installCode)}" language="bash"></emb-code-block>
            <emb-code-block code="${escapeAttribute(quickStartCode)}" language="ts"></emb-code-block>
          </div>
          <div class="preview-block">
            <strong>React</strong>
            <p class="muted">The React package wraps the same core elements and registers them for you, so usage stays close to standard JSX patterns.</p>
            <emb-code-block code="${escapeAttribute(reactInstallCode)}" language="bash"></emb-code-block>
            <emb-code-block code="${escapeAttribute(reactQuickStartCode)}" language="tsx"></emb-code-block>
          </div>
          <div class="preview-block">
            <strong>Vue</strong>
            <p class="muted">The Vue package exposes thin component wrappers over the same custom element implementation and shared styles.</p>
            <emb-code-block code="${escapeAttribute(vueInstallCode)}" language="bash"></emb-code-block>
            <emb-code-block code="${escapeAttribute(vueQuickStartCode)}" language="vue"></emb-code-block>
          </div>
        </div>

        <div class="preview-block">
          <div class="live-toolbar">
            <strong>Setup flow</strong>
            <emb-badge>Interactive example</emb-badge>
          </div>
          <emb-stepper id="setup-stepper" aria-label="Getting started steps" interactive></emb-stepper>
        </div>

        <div class="preview-block">
          <strong>Quick form composition</strong>
          <p class="muted">This example uses the same field primitives and button composition patterns expected in a consuming application.</p>
          <emb-form-field label="Project name" description="Shown to workspace members.">
            <emb-input placeholder="Emberline Docs"></emb-input>
          </emb-form-field>
          <emb-button-group attached>
            <emb-button variant="ghost">Cancel</emb-button>
            <emb-button>Create project</emb-button>
          </emb-button-group>
        </div>
      </section>

      <section class="section" id="components" data-active-section="${String(activeSectionId === "components")}">
        <div class="section-heading">
          <h2>Component reference</h2>
          <p>The catalog covers the current Emberline component surface and links directly to a dedicated docs view for each component.</p>
        </div>

        <div class="catalog-controls">
          <emb-search id="catalog-search" placeholder="Search components by name, category, or summary" value="${escapeAttribute(catalogQuery)}"></emb-search>
          <emb-segmented-control id="catalog-layer-filter" aria-label="Filter by component layer"></emb-segmented-control>
        </div>

        ${renderCatalogContent()}

        <div class="demo-grid">
          <div class="preview-block">
            <strong>Scheduling</strong>
            <p class="muted">Calendar and related date selection stay usable as standard web components.</p>
            <emb-calendar month="2026-04" range start-value="2026-04-12" end-value="2026-04-18"></emb-calendar>
          </div>
          <div class="preview-block">
            <strong>Uploads</strong>
            <p class="muted">Dropzone composes native file selection and drag/drop affordances.</p>
            <emb-dropzone multiple accept=".png,.jpg,.pdf"></emb-dropzone>
          </div>
        </div>
      </section>

      <section class="section" id="patterns" data-active-section="${String(activeSectionId === "patterns")}">
        <div class="section-heading">
          <h2>Patterns and workflows</h2>
          <p>Higher-level surfaces are composed from smaller primitives so behavior stays reusable and easier to reason about.</p>
        </div>

        <div class="demo-grid">
          <div class="preview-block">
            <div class="live-toolbar">
              <strong>Action clusters</strong>
              <emb-badge>Primitive reuse</emb-badge>
            </div>
            <emb-toolbar aria-label="Editor actions">
              <emb-button-group attached>
                <emb-button variant="ghost">Bold</emb-button>
                <emb-button variant="ghost">Italic</emb-button>
                <emb-button variant="ghost">Underline</emb-button>
              </emb-button-group>
              <emb-segmented-control id="tone-options" aria-label="Alert tone"></emb-segmented-control>
              <emb-icon-button label="More actions" name="ellipsis"></emb-icon-button>
            </emb-toolbar>
            <div class="callout">
              <emb-alert id="pattern-alert" tone="${activeAlertTone}">
                Compose higher-level patterns from reusable primitives instead of duplicating behavior in each component.
              </emb-alert>
            </div>
          </div>

          <div class="preview-block">
            <div class="live-toolbar">
              <strong>Search-first navigation</strong>
              <emb-badge>Dogfooded</emb-badge>
            </div>
            <p class="muted">The docs command palette is built from Emberline's dialog, search, listbox, and option components.</p>
            <emb-button data-action="open-palette">Jump with command palette</emb-button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderCatalogContent(): string {
  const filtered = getFilteredComponents();

  if (!filtered.length) {
    return `
      <emb-empty-state>
        <div class="card-body">
          <h3>No components match that filter</h3>
          <p class="muted">Try a broader search term or switch the current layer filter.</p>
        </div>
      </emb-empty-state>
    `;
  }

  const groups = groupComponentsByCategory(filtered);

  return `
    <div class="catalog-summary">
      <emb-badge tone="accent">${filtered.length} result${filtered.length === 1 ? "" : "s"}</emb-badge>
      <span class="muted">Showing ${catalogLayer === "all" ? "all layers" : catalogLayer.toLowerCase()} across the current component catalog.</span>
    </div>

    ${Array.from(groups.entries())
      .map(
        ([category, docs]) => `
          <section class="catalog-group">
            <div class="catalog-group-heading">
              <h3>${category}</h3>
              <p class="muted">${docs.length} component${docs.length === 1 ? "" : "s"}</p>
            </div>
            <div class="catalog-grid">
              ${docs.map((doc) => renderCatalogCard(doc)).join("")}
            </div>
          </section>
        `
      )
      .join("")}
  `;
}

function renderCatalogCard(doc: ComponentDoc): string {
  return `
    <a class="catalog-card" href="#components/${doc.slug}">
      <emb-card>
        <div class="card-body">
          <div class="component-meta">
            <emb-badge tone="accent">${doc.layer}</emb-badge>
            <emb-badge>${doc.category}</emb-badge>
          </div>
          <h3>${doc.title}</h3>
          <p class="muted">${doc.summary}</p>
          <div class="component-inline-meta">
            <code>${doc.tag}</code>
            <span>${doc.nativeFoundation}</span>
          </div>
        </div>
      </emb-card>
    </a>
  `;
}

function renderComponentDetail(slug: string): string {
  const doc = getComponentDoc(slug);
  if (!doc) {
    return `
      <section class="section">
        <emb-empty-state>
          <div class="card-body">
            <h2>Component not found</h2>
            <p class="muted">That docs route does not match the current Emberline component catalog.</p>
            <emb-button data-target-section="components">Back to component catalog</emb-button>
          </div>
        </emb-empty-state>
      </section>
    `;
  }

  const related = componentCatalog.filter((component) => component.category === doc.category && component.slug !== doc.slug).slice(0, 4);
  const api = getComponentApi(doc);

  return `
    <section class="component-page">
      <div class="component-page-header">
        <emb-breadcrumbs>
          <a href="#overview">Emberline UI</a>
          <a href="#components">Components</a>
          <a href="#components/${doc.slug}">${doc.title}</a>
        </emb-breadcrumbs>

        <div class="component-page-copy">
          <div class="component-meta">
            <emb-badge tone="accent">${doc.layer}</emb-badge>
            <emb-badge>${doc.category}</emb-badge>
          </div>
          <h1 class="component-page-title">${doc.title}</h1>
          <p class="muted">${doc.summary}</p>
        </div>
      </div>

      <div class="facts-grid">
        ${renderFactCard("Tag name", `<code>${doc.tag}</code>`)}
        ${renderFactCard("Layer", doc.layer)}
        ${renderFactCard("Category", doc.category)}
        ${renderFactCard("Native foundation", doc.nativeFoundation)}
      </div>

      <div class="component-page-grid">
        <section class="section">
          <div class="section-heading">
            <h2>Usage</h2>
            <p>The core web component API stays primary, and the React and Vue packages mirror that surface through thin wrappers instead of reimplementing component logic.</p>
          </div>

          <div class="usage-grid">
            <div class="preview-block">
              <strong>Web component</strong>
              <p class="muted">Use the custom element directly when you want the lowest-level standards-based integration.</p>
              <emb-code-block code="${escapeAttribute(getUsageCode(doc))}" language="html"></emb-code-block>
            </div>
            <div class="preview-block">
              <strong>React</strong>
              <p class="muted">Import the generated React wrapper when you want JSX ergonomics but the same underlying Emberline behavior.</p>
              <emb-code-block code="${escapeAttribute(getReactUsageCode(doc))}" language="tsx"></emb-code-block>
            </div>
            <div class="preview-block">
              <strong>Vue</strong>
              <p class="muted">Use the Vue wrapper when you want template-first usage while keeping the core component contract aligned with the custom element.</p>
              <emb-code-block code="${escapeAttribute(getVueUsageCode(doc))}" language="vue"></emb-code-block>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="section-heading">
            <h2>Living preview</h2>
            <p>${getPreviewDescription(doc)}</p>
          </div>

          ${renderComponentPreview(doc)}
        </section>
      </div>

      <section class="section">
        <div class="section-heading">
          <h2>API surface</h2>
          <p>${api.intro} Types, defaults, and allowed values are included where the public contract defines them.</p>
        </div>

        <div class="api-reference">
          ${api.groups.map((group) => renderApiGroup(group)).join("")}
        </div>
      </section>

      ${
        related.length
          ? `
            <section class="section">
              <div class="section-heading">
                <h2>Related components</h2>
                <p>Explore other ${doc.category.toLowerCase()} surfaces that compose well with ${doc.tag}.</p>
              </div>
              <div class="catalog-grid">
                ${related.map((component) => renderCatalogCard(component)).join("")}
              </div>
            </section>
          `
          : ""
      }
    </section>
  `;
}

function renderFactCard(label: string, value: string): string {
  return `
    <emb-card>
      <div class="card-body">
        <span class="eyebrow">${label}</span>
        <strong>${value}</strong>
      </div>
    </emb-card>
  `;
}

function renderComponentPreview(doc: ComponentDoc): string {
  const previewMarkup = getPreviewMarkup(doc);
  if (!previewMarkup) {
    return `
      <emb-alert tone="info">
        ${getPreviewFallbackText(doc)}
      </emb-alert>
    `;
  }

  return `<div class="component-preview-surface" data-component-preview="${doc.slug}">${previewMarkup}</div>`;
}

function renderApiGroup(group: ApiGroup): string {
  return `
    <section class="api-group-section">
      <div class="api-group-heading">
        <h3>${group.title}</h3>
        <span class="api-group-count">${group.items.length}</span>
      </div>
      ${
        group.items.length
          ? `
            <div class="api-entry-list">
              ${group.items.map((item) => renderApiEntry(group.title, item)).join("")}
            </div>
          `
          : `<p class="muted api-empty">${group.empty}</p>`
      }
    </section>
  `;
}

function renderApiEntry(groupTitle: string, item: ApiItem): string {
  return `
    <article class="api-entry">
      <div class="api-entry-header">
        <code class="api-entry-name">${item.name}</code>
        ${item.type ? `<span class="api-entry-type">${escapeHtml(item.type)}</span>` : ""}
      </div>
      ${renderApiEntryMeta(groupTitle, item)}
      <p class="api-entry-detail">${item.detail}</p>
      ${renderApiEntryValues(item)}
    </article>
  `;
}

function renderApiEntryMeta(groupTitle: string, item: ApiItem): string {
  const entries = [
    item.attributeName ? ["Attribute", item.attributeName] : null,
    item.defaultValue ? ["Default", item.defaultValue] : null,
    item.type && groupTitle === "Methods" ? ["Returns", item.type] : null
  ].filter((entry): entry is [string, string] => Boolean(entry));

  if (!entries.length) {
    return "";
  }

  return `
    <dl class="api-entry-meta">
      ${entries
        .map(
          ([label, value]) => `
            <div class="api-entry-meta-row">
              <dt>${label}</dt>
              <dd><code>${escapeHtml(value)}</code></dd>
            </div>
          `
        )
        .join("")}
    </dl>
  `;
}

function renderApiEntryValues(item: ApiItem): string {
  if (!item.values) {
    return "";
  }

  const values = item.values.split(/\s*,\s*/).filter(Boolean);
  if (!values.length) {
    return "";
  }

  return `
    <div class="api-entry-values">
      <div class="api-entry-values-title">Possible values</div>
      <ul class="api-entry-values-list">
        ${values
          .map(
            (value) => `
              <li>
                <code>${escapeHtml(value)}</code>
              </li>
            `
          )
          .join("")}
      </ul>
    </div>
  `;
}

function wireNavigation(): void {
  root.querySelectorAll<HTMLElement>("[data-target-section]").forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.dataset.targetSection;
      if (section) {
        window.location.hash = section;
      }
    });
  });

  root.querySelectorAll<HTMLElement>("[data-action='open-palette']").forEach((button) => {
    button.addEventListener("click", () => {
      openPalette();
    });
  });
}

function hydrateLivingExamples(route: Route): void {
  hydrateGlobalPalette();

  if (route.kind === "home") {
    hydrateHomeExamples();
    return;
  }

  hydrateComponentPage(route.slug);
}

function syncRouteScroll(route: Route): void {
  if (route.kind !== "component") {
    return;
  }

  requestAnimationFrame(() => {
    root.querySelector<HTMLElement>(".component-page-header")?.scrollIntoView({
      behavior: "auto",
      block: "start"
    });
  });
}

function hydrateGlobalPalette(): void {
  const palette = root.querySelector<CommandPaletteHost>("#docs-command-palette");
  if (!palette) {
    return;
  }

  palette.commands = [
    ...sections.map((section) => ({
      description: section.summary,
      keywords: [section.id, section.title.toLowerCase(), "docs"],
      label: `Go to ${section.title}`,
      value: section.id
    })),
    ...componentCatalog.map((component) => ({
      description: `${component.layer} ${component.category.toLowerCase()} surface`,
      keywords: [component.slug, component.category.toLowerCase(), component.layer.toLowerCase(), component.tag],
      label: `Open ${component.title}`,
      value: `components/${component.slug}`
    }))
  ];

  palette.addEventListener("command-select", handlePaletteSelect);
}

function hydrateHomeExamples(): void {
  const stepper = root.querySelector<StepperHost>("#setup-stepper");
  if (stepper) {
    stepper.steps = setupSteps;
    stepper.value = "register";
  }

  const toneSelector = root.querySelector<SegmentedControlHost>("#tone-options");
  if (toneSelector) {
    toneSelector.options = alertToneOptions;
    toneSelector.value = activeAlertTone;
    toneSelector.addEventListener("change", () => {
      activeAlertTone = (toneSelector.value as AlertTone) || "info";
      render();
    });
  }

  const catalogSearch = root.querySelector<SearchHost>("#catalog-search");
  if (catalogSearch) {
    catalogSearch.value = catalogQuery;
    catalogSearch.addEventListener("input", () => {
      catalogQuery = catalogSearch.value ?? "";
      render();
    });
  }

  const layerFilter = root.querySelector<SegmentedControlHost>("#catalog-layer-filter");
  if (layerFilter) {
    layerFilter.options = catalogLayerFilterOptions;
    layerFilter.value = catalogLayer;
    layerFilter.addEventListener("change", () => {
      catalogLayer = (layerFilter.value as ComponentLayerFilter) || "all";
      render();
    });
  }
}

function hydrateComponentPage(slug: string): void {
  if (slug === "command-palette") {
    const trigger = root.querySelector<HTMLElement>('[data-component-preview="command-palette"] [data-action="launch-preview-palette"]');
    trigger?.addEventListener("click", () => openPalette());
  }

  if (slug === "segmented-control") {
    const segmented = root.querySelector<SegmentedControlHost>('[data-component-preview="segmented-control"] #segmented-control-preview');
    if (segmented) {
      segmented.options = segmentedDemoOptions;
      segmented.value = "week";
    }
  }

  if (slug === "stepper") {
    const stepper = root.querySelector<StepperHost>('[data-component-preview="stepper"] #stepper-preview');
    if (stepper) {
      stepper.steps = stepperDetailSteps;
      stepper.value = "review";
    }
  }
}

function handlePaletteSelect(event: Event): void {
  const detail = (event as CustomEvent<{ value?: string }>).detail;
  if (detail.value) {
    window.location.hash = detail.value;
  }
}

function getRoute(): Route {
  const hash = window.location.hash.replace(/^#/, "");

  if (hash.startsWith("components/")) {
    const slug = hash.replace(/^components\//, "");
    if (getComponentDoc(slug)) {
      return { kind: "component", slug };
    }
  }

  const sectionId = sections.some((section) => section.id === hash) ? hash : "overview";
  return { kind: "home", sectionId };
}

function getFilteredComponents(): ComponentDoc[] {
  const normalizedQuery = catalogQuery.trim().toLowerCase();

  return componentCatalog.filter((component) => {
    const matchesLayer = catalogLayer === "all" || component.layer === catalogLayer;
    if (!matchesLayer) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [component.title, component.slug, component.tag, component.category, component.summary, component.nativeFoundation]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

function groupComponentsByCategory(components: ComponentDoc[]): Map<ComponentCategory, ComponentDoc[]> {
  const groups = new Map<ComponentCategory, ComponentDoc[]>();

  for (const component of components) {
    const existing = groups.get(component.category) ?? [];
    existing.push(component);
    groups.set(component.category, existing);
  }

  return new Map(Array.from(groups.entries()).sort((left, right) => left[0].localeCompare(right[0])));
}

function getUsageCode(doc: ComponentDoc): string {
  switch (doc.slug) {
    case "alert":
      return `<emb-alert tone="info">Update complete.</emb-alert>`;
    case "avatar":
      return `<emb-avatar name="Ember Line"></emb-avatar>`;
    case "badge":
      return `<emb-badge tone="accent">Beta</emb-badge>`;
    case "breadcrumbs":
      return `<emb-breadcrumbs>
  <a href="/">Home</a>
  <a href="/docs">Docs</a>
  <a href="/docs/components">Components</a>
</emb-breadcrumbs>`;
    case "button":
      return `<emb-button>Save changes</emb-button>`;
    case "button-group":
      return `<emb-button-group attached>
  <emb-button variant="ghost">Back</emb-button>
  <emb-button>Continue</emb-button>
</emb-button-group>`;
    case "calendar":
      return `<emb-calendar month="2026-04" value="2026-04-26"></emb-calendar>`;
    case "card":
      return `<emb-card>
  <div style="padding: var(--space-4);">Card content</div>
</emb-card>`;
    case "checkbox":
      return `<emb-checkbox>Enable email updates</emb-checkbox>`;
    case "chip":
      return `<emb-chip>UI System</emb-chip>`;
    case "code-block":
      return `<emb-code-block code="const ready = true;" language="ts"></emb-code-block>`;
    case "color-input":
      return `<emb-color-input value="#4f46e5"></emb-color-input>`;
    case "combobox":
      return `<emb-combobox placeholder="Choose a role">
  <option value="designer">Designer</option>
  <option value="engineer">Engineer</option>
  <option value="pm">Product manager</option>
</emb-combobox>`;
    case "command-palette":
      return `<emb-command-palette title="Workspace commands"></emb-command-palette>`;
    case "context-menu":
      return `<emb-context-menu>
  <div slot="trigger">Right click for actions</div>
  <emb-menu-item>Rename</emb-menu-item>
  <emb-menu-item>Duplicate</emb-menu-item>
</emb-context-menu>`;
    case "data-table":
      return `<emb-data-table caption="Team members"></emb-data-table>`;
    case "date-input":
      return `<emb-date-input value="2026-04-26"></emb-date-input>`;
    case "dialog":
      return `<emb-dialog open>
  <h2>Confirm action</h2>
  <p>Save current changes?</p>
</emb-dialog>`;
    case "divider":
      return `<emb-divider></emb-divider>`;
    case "drawer":
      return `<emb-drawer open>
  <h2>Preferences</h2>
  <p>Adjust workspace settings.</p>
</emb-drawer>`;
    case "dropdown-menu":
      return `<emb-dropdown-menu>
  <emb-menu-item>Rename</emb-menu-item>
  <emb-menu-item>Duplicate</emb-menu-item>
</emb-dropdown-menu>`;
    case "dropzone":
      return `<emb-dropzone multiple accept=".png,.jpg,.pdf"></emb-dropzone>`;
    case "email-input":
      return `<emb-email-input value="hello@example.com"></emb-email-input>`;
    case "empty-state":
      return `<emb-empty-state>
  <h3>No projects yet</h3>
  <p>Create your first workspace to get started.</p>
</emb-empty-state>`;
    case "error-text":
      return `<emb-error-text>Please enter a valid email address.</emb-error-text>`;
    case "fieldset":
      return `<emb-fieldset legend="Notifications">
  <emb-checkbox>Email</emb-checkbox>
  <emb-checkbox>Push</emb-checkbox>
</emb-fieldset>`;
    case "file-input":
      return `<emb-file-input multiple accept=".pdf,.png"></emb-file-input>`;
    case "form-field":
      return `<emb-form-field label="Project name" description="Shown to your teammates.">
  <emb-input></emb-input>
</emb-form-field>`;
    case "helper-text":
      return `<emb-helper-text>Used for keyboard shortcuts and system labels.</emb-helper-text>`;
    case "icon":
      return `<emb-icon name="sparkles"></emb-icon>`;
    case "icon-button":
      return `<emb-icon-button label="Search" name="search"></emb-icon-button>`;
    case "input":
      return `<emb-input placeholder="Project name"></emb-input>`;
    case "link":
      return `<emb-link href="#components">Browse components</emb-link>`;
    case "listbox":
      return `<emb-listbox selected-value="design">
  <emb-option value="design">Designer</emb-option>
  <emb-option value="engineering">Engineer</emb-option>
</emb-listbox>`;
    case "menu":
      return `<emb-menu>
  <emb-menu-item>Rename</emb-menu-item>
  <emb-menu-item>Archive</emb-menu-item>
</emb-menu>`;
    case "menu-item":
      return `<emb-menu>
  <emb-menu-item>Open settings</emb-menu-item>
</emb-menu>`;
    case "meter":
      return `<emb-meter min="0" max="100" low="25" high="75" optimum="90" value="72">72%</emb-meter>`;
    case "number-input":
      return `<emb-number-input value="12"></emb-number-input>`;
    case "option":
      return `<emb-listbox>
  <emb-option selected value="design">Designer</emb-option>
</emb-listbox>`;
    case "pagination":
      return `<emb-pagination current-page="3" total-pages="12"></emb-pagination>`;
    case "password-input":
      return `<emb-password-input value="supersecret"></emb-password-input>`;
    case "popover":
      return `<emb-popover open>
  <p>Supplemental information anchored to a trigger.</p>
</emb-popover>`;
    case "progress":
      return `<emb-progress max="100" value="68">68%</emb-progress>`;
    case "radio":
      return `<emb-radio name="plan">Pro</emb-radio>`;
    case "range":
      return `<emb-range min="0" max="100" value="40"></emb-range>`;
    case "rating-input":
      return `<emb-rating-input value="4"></emb-rating-input>`;
    case "search":
      return `<emb-search placeholder="Search docs"></emb-search>`;
    case "segmented-control":
      return `<emb-segmented-control></emb-segmented-control>`;
    case "select":
      return `<emb-select>
  <option>Starter</option>
  <option>Pro</option>
</emb-select>`;
    case "skeleton":
      return `<emb-skeleton></emb-skeleton>`;
    case "splitter":
      return `<emb-splitter style="height: 18rem;">
  <emb-splitter-panel size="28">Navigation</emb-splitter-panel>
  <emb-splitter-panel size="72">Workspace</emb-splitter-panel>
</emb-splitter>`;
    case "splitter-panel":
      return `<emb-splitter-panel size="30">Panel content</emb-splitter-panel>`;
    case "spinner":
      return `<emb-spinner></emb-spinner>`;
    case "stepper":
      return `<emb-stepper></emb-stepper>`;
    case "switch":
      return `<emb-switch>Available for notifications</emb-switch>`;
    case "tabs":
      return `<emb-tabs value="overview"></emb-tabs>`;
    case "tel-input":
      return `<emb-tel-input value="+1 555 123 4567"></emb-tel-input>`;
    case "textarea":
      return `<emb-textarea rows="4">Notes</emb-textarea>`;
    case "time-input":
      return `<emb-time-input value="09:30"></emb-time-input>`;
    case "toast":
      return `<emb-toast open tone="success">Saved successfully.</emb-toast>`;
    case "toast-region":
      return `<emb-toast-region></emb-toast-region>`;
    case "toolbar":
      return `<emb-toolbar aria-label="Formatting actions">
  <emb-button-group attached>
    <emb-button variant="ghost">Bold</emb-button>
    <emb-button variant="ghost">Italic</emb-button>
  </emb-button-group>
</emb-toolbar>`;
    case "tree-item":
      return `<emb-tree-item label="Guides" expanded>
  <emb-tree-item label="Getting started"></emb-tree-item>
</emb-tree-item>`;
    case "tree-view":
      return `<emb-tree-view>
  <emb-tree-item label="Overview"></emb-tree-item>
  <emb-tree-item label="Guides" expanded>
    <emb-tree-item label="Getting started"></emb-tree-item>
    <emb-tree-item label="Theming"></emb-tree-item>
  </emb-tree-item>
</emb-tree-view>`;
    case "tooltip":
      return `<emb-tooltip text="Helpful context"></emb-tooltip>`;
    case "url-input":
      return `<emb-url-input value="https://emberline.dev"></emb-url-input>`;
    case "accordion":
      return `<emb-accordion open>
  <h3>Why Emberline?</h3>
  <p>Reusable primitives keep the library composable.</p>
</emb-accordion>`;
    default:
      return `<${doc.tag}></${doc.tag}>`;
  }
}

function getReactUsageCode(doc: ComponentDoc): string {
  const componentName = getWrapperComponentName(doc.tag);

  return `import "emberline-ui-core/styles.css";
import { ${componentName} } from "emberline-ui-react";

export function Example() {
  return (
    ${getReactUsageMarkup(doc, componentName)}
  );
}`;
}

function getVueUsageCode(doc: ComponentDoc): string {
  const componentName = getWrapperComponentName(doc.tag);

  return `<script setup lang="ts">
import "emberline-ui-core/styles.css";
import { ${componentName} } from "emberline-ui-vue";
</script>

<template>
  ${getVueUsageMarkup(doc, componentName)}
</template>`;
}

function getWrapperComponentName(tagName: string): string {
  return tagName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function getReactUsageMarkup(doc: ComponentDoc, componentName: string): string {
  switch (doc.slug) {
    case "alert":
      return `<${componentName} tone="info">Update complete.</${componentName}>`;
    case "badge":
      return `<${componentName} tone="accent">Beta</${componentName}>`;
    case "breadcrumbs":
      return `<${componentName}>
      <a href="/">Home</a>
      <a href="/docs">Docs</a>
      <a href="/docs/components">Components</a>
    </${componentName}>`;
    case "button":
      return `<${componentName}>Save changes</${componentName}>`;
    case "checkbox":
      return `<${componentName}>Enable email updates</${componentName}>`;
    case "chip":
      return `<${componentName}>UI System</${componentName}>`;
    case "code-block":
      return `<${componentName} code="const ready = true;" language="ts" />`;
    case "dialog":
      return `<${componentName} open>
      <h2>Confirm action</h2>
      <p>Save current changes?</p>
    </${componentName}>`;
    case "empty-state":
      return `<${componentName}>
      <h3>No projects yet</h3>
      <p>Create your first workspace to get started.</p>
    </${componentName}>`;
    case "error-text":
      return `<${componentName}>Please enter a valid email address.</${componentName}>`;
    case "helper-text":
      return `<${componentName}>Used for keyboard shortcuts and system labels.</${componentName}>`;
    case "icon-button":
      return `<${componentName} label="Search" name="search" />`;
    case "input":
      return `<${componentName} placeholder="Project name" />`;
    case "link":
      return `<${componentName} href="#components">Browse components</${componentName}>`;
    case "context-menu":
      return `<${componentName}>
      <div slot="trigger">Right click for actions</div>
      <emb-menu-item>Rename</emb-menu-item>
      <emb-menu-item>Duplicate</emb-menu-item>
    </${componentName}>`;
    case "number-input":
      return `<${componentName} value="12" />`;
    case "progress":
      return `<${componentName} max={100} value={68}>68%</${componentName}>`;
    case "search":
      return `<${componentName} placeholder="Search docs" />`;
    case "splitter":
      return `<${componentName} style={{ height: "18rem" }}>
      <emb-splitter-panel size="28">Navigation</emb-splitter-panel>
      <emb-splitter-panel size="72">Workspace</emb-splitter-panel>
    </${componentName}>`;
    case "splitter-panel":
      return `<${componentName} size={30}>Panel content</${componentName}>`;
    case "switch":
      return `<${componentName}>Available for notifications</${componentName}>`;
    case "textarea":
      return `<${componentName} rows={4}>Notes</${componentName}>`;
    case "tree-item":
      return `<${componentName} label="Guides" expanded>
      <emb-tree-item label="Getting started"></emb-tree-item>
    </${componentName}>`;
    case "tree-view":
      return `<${componentName}>
      <emb-tree-item label="Overview"></emb-tree-item>
      <emb-tree-item label="Guides" expanded>
        <emb-tree-item label="Getting started"></emb-tree-item>
      </emb-tree-item>
    </${componentName}>`;
    default:
      return `<${componentName} />`;
  }
}

function getVueUsageMarkup(doc: ComponentDoc, componentName: string): string {
  switch (doc.slug) {
    case "alert":
      return `<${componentName} tone="info">Update complete.</${componentName}>`;
    case "badge":
      return `<${componentName} tone="accent">Beta</${componentName}>`;
    case "breadcrumbs":
      return `<${componentName}>
    <a href="/">Home</a>
    <a href="/docs">Docs</a>
    <a href="/docs/components">Components</a>
  </${componentName}>`;
    case "button":
      return `<${componentName}>Save changes</${componentName}>`;
    case "checkbox":
      return `<${componentName}>Enable email updates</${componentName}>`;
    case "chip":
      return `<${componentName}>UI System</${componentName}>`;
    case "code-block":
      return `<${componentName} code="const ready = true;" language="ts" />`;
    case "dialog":
      return `<${componentName} open>
    <h2>Confirm action</h2>
    <p>Save current changes?</p>
  </${componentName}>`;
    case "empty-state":
      return `<${componentName}>
    <h3>No projects yet</h3>
    <p>Create your first workspace to get started.</p>
  </${componentName}>`;
    case "error-text":
      return `<${componentName}>Please enter a valid email address.</${componentName}>`;
    case "helper-text":
      return `<${componentName}>Used for keyboard shortcuts and system labels.</${componentName}>`;
    case "icon-button":
      return `<${componentName} label="Search" name="search" />`;
    case "input":
      return `<${componentName} placeholder="Project name" />`;
    case "link":
      return `<${componentName} href="#components">Browse components</${componentName}>`;
    case "context-menu":
      return `<${componentName}>
    <div slot="trigger">Right click for actions</div>
    <emb-menu-item>Rename</emb-menu-item>
    <emb-menu-item>Duplicate</emb-menu-item>
  </${componentName}>`;
    case "number-input":
      return `<${componentName} :value="12" />`;
    case "progress":
      return `<${componentName} :max="100" :value="68">68%</${componentName}>`;
    case "search":
      return `<${componentName} placeholder="Search docs" />`;
    case "splitter":
      return `<${componentName} style="height: 18rem;">
    <emb-splitter-panel :size="28">Navigation</emb-splitter-panel>
    <emb-splitter-panel :size="72">Workspace</emb-splitter-panel>
  </${componentName}>`;
    case "splitter-panel":
      return `<${componentName} :size="30">Panel content</${componentName}>`;
    case "switch":
      return `<${componentName}>Available for notifications</${componentName}>`;
    case "textarea":
      return `<${componentName} :rows="4">Notes</${componentName}>`;
    case "tree-item":
      return `<${componentName} label="Guides" expanded>
    <emb-tree-item label="Getting started"></emb-tree-item>
  </${componentName}>`;
    case "tree-view":
      return `<${componentName}>
    <emb-tree-item label="Overview"></emb-tree-item>
    <emb-tree-item label="Guides" expanded>
      <emb-tree-item label="Getting started"></emb-tree-item>
    </emb-tree-item>
  </${componentName}>`;
    default:
      return `<${componentName} />`;
  }
}

function getPreviewMarkup(doc: ComponentDoc): string | null {
  switch (doc.slug) {
    case "alert":
    case "avatar":
    case "badge":
    case "breadcrumbs":
    case "button":
    case "button-group":
    case "calendar":
    case "card":
    case "checkbox":
    case "chip":
    case "code-block":
    case "color-input":
    case "combobox":
    case "date-input":
    case "divider":
    case "dropzone":
    case "email-input":
    case "empty-state":
    case "error-text":
    case "fieldset":
    case "file-input":
    case "form-field":
    case "helper-text":
    case "icon":
    case "icon-button":
    case "input":
    case "link":
    case "listbox":
    case "menu":
    case "menu-item":
    case "meter":
    case "number-input":
    case "option":
    case "pagination":
    case "password-input":
    case "progress":
    case "radio":
    case "range":
    case "rating-input":
    case "search":
    case "select":
    case "skeleton":
    case "splitter":
    case "splitter-panel":
    case "spinner":
    case "switch":
    case "tel-input":
    case "textarea":
    case "time-input":
    case "toast":
    case "toolbar":
    case "tree-item":
    case "tree-view":
    case "url-input":
      return getUsageCode(doc);
    case "data-table":
      return `<div class="preview-block">
        <strong>Small data set preview</strong>
        <p class="muted">The richer table behavior appears once the docs app hydrates sample row data.</p>
        <table class="plain-preview-table">
          <thead>
            <tr><th>Component</th><th>Layer</th><th>Use</th></tr>
          </thead>
          <tbody>
            ${dataTableSampleRows.map((row) => `<tr><td>${row.component}</td><td>${row.layer}</td><td>${row.use}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>`;
    case "segmented-control":
      return `<emb-segmented-control id="segmented-control-preview" aria-label="Segmented control preview"></emb-segmented-control>`;
    case "stepper":
      return `<emb-stepper id="stepper-preview" aria-label="Stepper preview" interactive></emb-stepper>`;
    case "accordion":
    case "command-palette":
    case "context-menu":
    case "dialog":
    case "drawer":
    case "dropdown-menu":
    case "popover":
    case "tabs":
    case "toast-region":
    case "tooltip":
      return null;
    default:
      return null;
  }
}

function getPreviewDescription(doc: ComponentDoc): string {
  if (getPreviewMarkup(doc)) {
    return `This preview is rendered with the same ${doc.tag} custom element surface used by consumers.`;
  }

  return `This page documents ${doc.tag} directly, even when the richer interaction flow is better explored in Storybook or in a full application context.`;
}

function getPreviewFallbackText(doc: ComponentDoc): string {
  switch (doc.slug) {
    case "command-palette":
      return "Use the docs command palette itself with Ctrl/Cmd+K to experience the component in-context.";
    case "context-menu":
      return "Context menu is easiest to explore with an actual right-click target or keyboard-triggered menu scenario, so Storybook remains the richer interaction surface.";
    case "dialog":
    case "drawer":
    case "popover":
    case "dropdown-menu":
    case "tooltip":
      return "This overlay component is documented here, but the more complete interaction flow is best explored through Storybook scenarios and app-level composition.";
    case "tabs":
    case "accordion":
      return "This composed navigation surface has a dedicated docs route now; richer multi-panel examples can be layered in next without changing the URL shape.";
    case "toast-region":
      return "Toast region is an app-level host. It is typically exercised together with imperative toast helpers rather than as a standalone visual example.";
    default:
      return "This component currently has usage-first documentation on this route. Richer live demos can be added without changing the underlying page structure.";
  }
}

function getComponentApi(doc: ComponentDoc): ComponentApiSurface {
  return getGeneratedComponentApi(doc) ?? getLegacyComponentApi(doc);
}

function getGeneratedComponentApi(doc: ComponentDoc): ComponentApiSurface | null {
  const component = componentDocsByTag.get(doc.tag);
  if (!component) {
    return null;
  }

  return {
    groups: [
      {
        empty: "No public attributes or properties are currently documented for this component.",
        items: component.properties.map((property) => generatedPropertyToApiItem(property)),
        title: "Attributes and properties"
      },
      {
        empty: "This component does not expose additional public methods beyond standard element APIs.",
        items: component.methods.map((method) => generatedMethodToApiItem(method)),
        title: "Methods"
      },
      {
        empty: "No custom events are currently documented for this component.",
        items: component.events.map((event) => generatedEventToApiItem(event)),
        title: "Events"
      },
      {
        empty: "No public slots are currently documented for this component.",
        items: component.slots.map((slot) => generatedSlotToApiItem(slot)),
        title: "Slots"
      }
    ],
    intro:
      component.summary ||
      component.description ||
      `${doc.tag} API details are generated from the core component source so the docs stay aligned with the actual custom element contract.`
  };
}

function generatedEventToApiItem(event: GeneratedComponentEvent): ApiItem {
  return {
    detail: event.description || "Custom event emitted by the component.",
    name: event.name,
    type: event.type ?? undefined,
    values: event.values ? event.values.map((value) => `"${value}"`).join(", ") : undefined
  };
}

function generatedMethodToApiItem(method: GeneratedComponentMethod): ApiItem {
  const signature = `${method.name}(${method.parameters
    .map((parameter) => `${parameter.name}${parameter.optional ? "?" : ""}${parameter.type ? `: ${parameter.type}` : ""}`)
    .join(", ")})`;

  return {
    detail: method.description || "Public instance method exposed by the custom element.",
    name: signature,
    type: method.returnType ?? undefined
  };
}

function generatedPropertyToApiItem(property: GeneratedComponentProperty): ApiItem {
  return {
    attributeName: property.attributeName,
    defaultValue: property.defaultValue ?? undefined,
    detail:
      property.description ||
      `${property.attributeName ? "Public reflected API surface." : "Public property assigned from JavaScript."}`,
    name: property.name,
    type: property.type ?? undefined,
    values: property.values ? property.values.map((value) => `"${value}"`).join(", ") : undefined
  };
}

function generatedSlotToApiItem(slot: GeneratedComponentSlot): ApiItem {
  return {
    detail: slot.description || "Slot exposed by the component template.",
    name: slot.name === "default" ? "default slot" : slot.name,
    type: "slot"
  };
}

function getLegacyComponentApi(doc: ComponentDoc): ComponentApiSurface {
  const apiItem = (name: string, detail: string, options: ApiItemOptions = {}): ApiItem => ({
    detail,
    name,
    ...options
  });

  const eventGroup = (items: ApiItem[], empty = "No Emberline-specific events are documented for this component. Native DOM events still apply where relevant."): ApiGroup => ({
    empty,
    items,
    title: "Events"
  });

  const propertyGroup = (items: ApiItem[], empty = "No additional component properties are highlighted here beyond the default HTML usage shown above."): ApiGroup => ({
    empty,
    items,
    title: "Attributes and properties"
  });

  const compositionGroup = (items: ApiItem[], empty = "This component is typically used as a standalone custom element."): ApiGroup => ({
    empty,
    items,
    title: "Composition"
  });

  const formControlApi = (controlLabel: string, slotItems: ApiItem[] = []): ComponentApiSurface => ({
    groups: [
      propertyGroup([
        apiItem("value", `Current ${controlLabel} value.`, { defaultValue: `""`, type: "string" }),
        apiItem("disabled", "Disables user interaction and form participation.", { defaultValue: "false", type: "boolean" }),
        apiItem("name", "Associates the control with a form field name.", { defaultValue: `""`, type: "string" }),
        apiItem("required", "Marks the control as required when the underlying native control supports it.", { defaultValue: "false", type: "boolean" })
      ]),
      eventGroup([
        apiItem("input", "Fires as the current value changes.", { type: "Event" }),
        apiItem("change", "Fires when the value is committed by the user.", { type: "Event" })
      ]),
      compositionGroup(slotItems)
    ],
    intro: `Most integrations with ${doc.tag} revolve around its form value, standard disabled and required state, and native-style input/change events.`
  });

  const booleanControlApi = (): ComponentApiSurface => ({
    groups: [
      propertyGroup([
        apiItem("checked", "Current checked state.", { defaultValue: "false", type: "boolean" }),
        apiItem("value", "Submitted form value when checked.", { defaultValue: `"on"`, type: "string" }),
        apiItem("name", "Associates the control with a form field name.", { defaultValue: `""`, type: "string" }),
        apiItem("disabled", "Disables user interaction and form participation.", { defaultValue: "false", type: "boolean" }),
        apiItem("required", "Marks the control as required when used in form validation.", { defaultValue: "false", type: "boolean" })
      ]),
      eventGroup([
        apiItem("input", "Fires as the checked state changes.", { type: "Event" }),
        apiItem("change", "Fires when the user commits a checked-state change.", { type: "Event" })
      ]),
      compositionGroup([apiItem("default slot", "Default slot content is used as the visible control label.", { type: "slot" })])
    ],
    intro: `${doc.tag} follows the same integration shape as a native boolean form control: checked state, form wiring, and input/change events.`
  });

  const overlayApi = (extraProperties: ApiItem[] = [], extraEvents: ApiItem[] = [], compositionItems: ApiItem[] = []): ComponentApiSurface => ({
    groups: [
      propertyGroup([apiItem("open", "Controls whether the overlay is presented.", { defaultValue: "false", type: "boolean" }), ...extraProperties]),
      eventGroup(
        [
          apiItem("close", "Fires when the overlay closes.", { type: "Event" }),
          ...extraEvents
        ],
        "No additional overlay events are documented here."
      ),
      compositionGroup(compositionItems)
    ],
    intro: `${doc.tag} is documented as an overlay surface. The main public API is its open state plus the slotted content or child primitives it hosts.`
  });

  if (["input", "email-input", "number-input", "password-input", "search", "tel-input", "url-input"].includes(doc.slug)) {
    return formControlApi("field");
  }

  if (["color-input", "date-input", "time-input", "range"].includes(doc.slug)) {
    return formControlApi("control");
  }

  if (doc.slug === "textarea") {
    return formControlApi("text content", [apiItem("initial text", "Initial markup text becomes the initial textarea value when authored in HTML.", { type: "text content" })]);
  }

  if (doc.slug === "select") {
    return formControlApi("selected option", [apiItem("default slot", "Provide native <option> elements as children.", { type: "slot" })]);
  }

  if (["checkbox", "radio", "switch"].includes(doc.slug)) {
    return booleanControlApi();
  }

  switch (doc.slug) {
    case "accordion":
      return {
        groups: [
          propertyGroup([apiItem("open", "Controls whether the disclosure content is expanded.", { defaultValue: "false", type: "boolean" })]),
          eventGroup([apiItem("toggle", "Fires when the disclosure toggles open or closed.", { type: "Event" })]),
          compositionGroup([apiItem("default slot", "Pass the accordion summary and content through the default slot.", { type: "slot" })])
        ],
        intro: `${doc.tag} exposes a small disclosure API: open state, a toggle event, and slotted summary/content.`
      };
    case "alert":
      return {
        groups: [
          propertyGroup([apiItem("tone", "Visual tone for informational, success, warning, or danger messaging.", {
            defaultValue: `"info"`,
            type: `"info" | "success" | "warning" | "danger"`,
            values: `"info", "success", "warning", "danger"`
          })]),
          eventGroup([]),
          compositionGroup([apiItem("default slot", "Default slot content becomes the alert message body.", { type: "slot" })])
        ],
        intro: `${doc.tag} is a presentational feedback primitive. In practice the public API is its tone plus the slotted message content.`
      };
    case "avatar":
      return {
        groups: [
          propertyGroup([
            apiItem("name", "Name used for fallback initials when no image is available.", { defaultValue: `""`, type: "string" }),
            apiItem("src", "Image source for the avatar.", { defaultValue: `""`, type: "string" }),
            apiItem("alt", "Alternate text for the image when one is rendered.", { defaultValue: `""`, type: "string" })
          ]),
          eventGroup([]),
          compositionGroup([])
        ],
        intro: `${doc.tag} primarily exposes identity data for image and fallback rendering.`
      };
    case "badge":
      return {
        groups: [
          propertyGroup([apiItem("tone", "Visual tone for neutral, accent, or success styling.", {
            defaultValue: `"neutral"`,
            type: `"neutral" | "accent" | "success"`,
            values: `"neutral", "accent", "success"`
          })]),
          eventGroup([]),
          compositionGroup([apiItem("default slot", "Default slot content becomes the badge label.", { type: "slot" })])
        ],
        intro: `${doc.tag} keeps a deliberately small API: tone plus inline label content.`
      };
    case "breadcrumbs":
      return {
        groups: [
          propertyGroup([]),
          eventGroup([]),
          compositionGroup([apiItem("default slot", "Provide anchor elements in document order to describe the current path.", { type: "slot" })])
        ],
        intro: `${doc.tag} is composition-first. Its API is the trail of slotted links rather than custom JavaScript state.`
      };
    case "button":
      return {
        groups: [
          propertyGroup([
            apiItem("variant", "Switches between solid and ghost button treatments.", {
              defaultValue: `"solid"`,
              type: `"solid" | "ghost"`,
              values: `"solid", "ghost"`
            }),
            apiItem("type", "Maps through to the native button type attribute.", {
              defaultValue: `"button"`,
              type: `"button" | "submit" | "reset"`,
              values: `"button", "submit", "reset"`
            }),
            apiItem("disabled", "Disables pointer and keyboard activation.", { defaultValue: "false", type: "boolean" }),
            apiItem("icon-only", "Shrinks the control for icon-only usage.", { defaultValue: "false", type: "boolean" })
          ]),
          eventGroup([apiItem("click", "Uses the native click event from the internal button control.", { type: "MouseEvent" })]),
          compositionGroup([
            apiItem("default slot", "Primary button label content.", { type: "slot" }),
            apiItem("start-icon", "Leading icon content.", { type: "named slot" }),
            apiItem("end-icon", "Trailing icon content.", { type: "named slot" })
          ])
        ],
        intro: `${doc.tag} intentionally mirrors the native button model while adding styling and icon slots.`
      };
    case "button-group":
      return {
        groups: [
          propertyGroup([
            apiItem("attached", "Removes interior radii so adjacent buttons visually join.", { defaultValue: "false", type: "boolean" }),
            apiItem("orientation", "Stacks grouped buttons vertically instead of horizontally.", {
              defaultValue: `"horizontal"`,
              type: `"horizontal" | "vertical"`,
              values: `"horizontal", "vertical"`
            })
          ]),
          eventGroup([]),
          compositionGroup([apiItem("default slot", "Provide one or more emb-button children.", { type: "slot" })])
        ],
        intro: `${doc.tag} is a layout primitive for related buttons. Its API is mostly about grouping behavior rather than new interaction events.`
      };
    case "calendar":
      return {
        groups: [
          propertyGroup([
            apiItem("month", "Visible month in YYYY-MM format.", { type: "string (YYYY-MM)" }),
            apiItem("value", "Current selected date or range anchor.", { defaultValue: `""`, type: "string (YYYY-MM-DD)" }),
            apiItem("range", "Enables range selection behavior.", { defaultValue: "false", type: "boolean" })
          ]),
          eventGroup([
            apiItem("input", "Fires as the selected date value changes.", { type: "Event" }),
            apiItem("change", "Fires when a date selection is committed.", { type: "Event" })
          ]),
          compositionGroup([])
        ],
        intro: `${doc.tag} exposes month state and date selection through a small value-driven API.`
      };
    case "card":
    case "empty-state":
    case "fieldset":
      return {
        groups: [
          propertyGroup([]),
          eventGroup([]),
          compositionGroup([apiItem("default slot", "Pass the component body through the default slot.", { type: "slot" })])
        ],
        intro: `${doc.tag} is composition-first. The main public surface is the content you slot into it.`
      };
    case "chip":
      return {
        groups: [
          propertyGroup([]),
          eventGroup([]),
          compositionGroup([apiItem("default slot", "Default slot content becomes the chip label.", { type: "slot" })])
        ],
        intro: `${doc.tag} is a simple token primitive with a minimal content-only API.`
      };
    case "code-block":
      return {
        groups: [
          propertyGroup([
            apiItem("code", "Raw code string to render.", { defaultValue: `""`, type: "string" }),
            apiItem("language", "Optional language hint for syntax highlighting.", { type: "string" })
          ]),
          eventGroup([]),
          compositionGroup([])
        ],
        intro: `${doc.tag} is configured through code and language properties rather than slotted children.`
      };
    case "combobox":
      return {
        groups: [
          propertyGroup([
            apiItem("value", "Current selected value.", { defaultValue: `""`, type: "string" }),
            apiItem("placeholder", "Placeholder text shown before selection.", { defaultValue: `""`, type: "string" }),
            apiItem("disabled", "Disables user interaction.", { defaultValue: "false", type: "boolean" })
          ]),
          eventGroup([
            apiItem("input", "Fires as the combobox selection changes.", { type: "Event" }),
            apiItem("change", "Fires when a selection is committed.", { type: "Event" })
          ]),
          compositionGroup([apiItem("default slot", "Provide native <option> children for the available choices.", { type: "slot" })])
        ],
        intro: `${doc.tag} behaves like a searchable value picker: current value, optional placeholder, and change events.`
      };
    case "command-palette":
      return {
        groups: [
          propertyGroup([
            apiItem("commands", "Array of command objects assigned as a property.", { defaultValue: "[]", type: "CommandPaletteCommand[]" }),
            apiItem("open", "Controls palette visibility.", { defaultValue: "false", type: "boolean" }),
            apiItem("query", "Current search query.", { defaultValue: `""`, type: "string" }),
            apiItem("value", "Current selected command value.", { defaultValue: `""`, type: "string" }),
            apiItem("title", "Visible dialog title.", { defaultValue: `"Command palette"`, type: "string" }),
            apiItem("empty-message", "Message shown when filtering returns no matches.", { defaultValue: `"No matching commands."`, type: "string" }),
            apiItem("placeholder", "Placeholder text for the search field.", { defaultValue: `"Search commands"`, type: "string" })
          ]),
          eventGroup([
            apiItem("input", "Fires as the selected command value changes.", { type: "Event" }),
            apiItem("change", "Fires after a command is selected.", { type: "Event" }),
            apiItem("command-select", "Fires with the chosen command payload.", { type: "CustomEvent<{ command, value }>" }),
            apiItem("close", "Fires when the palette closes.", { type: "Event" }),
            apiItem("cancel", "Fires when the user cancels the palette.", { type: "Event" })
          ]),
          compositionGroup([])
        ],
        intro: `${doc.tag} is property-driven. Most integrations assign a command array in JavaScript and listen for command-select to route the chosen action.`
      };
    case "data-table":
      return {
        groups: [
          propertyGroup([
            apiItem("caption", "Caption text for the table.", { defaultValue: `""`, type: "string" }),
            apiItem("columns / rows", "Columns and rows are typically assigned as JavaScript properties.", { type: "assigned data objects" })
          ]),
          eventGroup([apiItem("change", "Sorting, searching, and pagination interactions generally surface through value-like change events in the component.", { type: "Event" })], "Data table behavior is primarily configured through assigned properties and child state."),
          compositionGroup([])
        ],
        intro: `${doc.tag} is one of the more stateful components in the library. In practice it is driven by assigned data and table configuration rather than slot content.`
      };
    case "dialog":
      return overlayApi(
        [apiItem("modal", "Switches between modal and non-modal presentation.", { defaultValue: "true", type: "boolean" })],
        [apiItem("cancel", "Fires when the user dismisses the dialog through native cancel affordances.", { type: "Event" })],
        [apiItem("default slot", "Provide dialog headings, body content, and actions through the default slot.", { type: "slot" })]
      );
    case "divider":
      return {
        groups: [propertyGroup([]), eventGroup([]), compositionGroup([])],
        intro: `${doc.tag} is a purely visual separator with no component-specific interaction API.`
      };
    case "dropdown-menu":
      return overlayApi(
        [],
        [apiItem("click / option events", "Menu item selection is typically handled through the menu-item child that was activated.", { type: "Event" })],
        [apiItem("child menu primitives", "Compose the trigger and menu content using the documented menu primitives.", { type: "child elements" })]
      );
    case "dropzone":
      return {
        groups: [
          propertyGroup([
            apiItem("accept", "Accept string passed through to the underlying file input.", { defaultValue: `""`, type: "string" }),
            apiItem("multiple", "Allows more than one file to be selected.", { defaultValue: "false", type: "boolean" }),
            apiItem("disabled", "Disables drag/drop and picker interaction.", { defaultValue: "false", type: "boolean" })
          ]),
          eventGroup([
            apiItem("input", "Fires as the selected files change.", { type: "Event" }),
            apiItem("change", "Fires when file selection is committed.", { type: "Event" })
          ]),
          compositionGroup([apiItem("default slot", "Optional default slot content can replace the dropzone prompt.", { type: "slot" })])
        ],
        intro: `${doc.tag} wraps native file selection and drag-and-drop. Its public API mostly mirrors file input attributes and events.`
      };
    case "file-input":
      return {
        groups: [
          propertyGroup([
            apiItem("accept", "Accept string passed through to the native file input.", { defaultValue: `""`, type: "string" }),
            apiItem("multiple", "Allows more than one file to be selected.", { defaultValue: "false", type: "boolean" }),
            apiItem("name", "Associates the control with a form field name.", { defaultValue: `""`, type: "string" }),
            apiItem("disabled", "Disables file selection.", { defaultValue: "false", type: "boolean" })
          ]),
          eventGroup([
            apiItem("input", "Fires as the selected file list changes.", { type: "Event" }),
            apiItem("change", "Fires when file selection is committed.", { type: "Event" })
          ]),
          compositionGroup([])
        ],
        intro: `${doc.tag} mirrors the native file input model while adding Emberline styling and summaries.`
      };
    case "form-field":
      return {
        groups: [
          propertyGroup([
            apiItem("label", "Visible field label text.", { defaultValue: `""`, type: "string" }),
            apiItem("description", "Optional supporting description text.", { defaultValue: `""`, type: "string" }),
            apiItem("error", "Optional error message text.", { defaultValue: `""`, type: "string" })
          ]),
          eventGroup([]),
          compositionGroup([
            apiItem("default slot", "Place the actual form control in the default slot.", { type: "slot" }),
            apiItem("supporting content", "Optional help or error text can be supplied through the component slots or properties used by the wrapper.", { type: "slot or property content" })
          ])
        ],
        intro: `${doc.tag} is a framing component. Its API is mostly about labeling and the slotted control it wraps.`
      };
    case "helper-text":
    case "error-text":
      return {
        groups: [
          propertyGroup([]),
          eventGroup([]),
          compositionGroup([apiItem("default slot", "Default slot content becomes the text body.", { type: "slot" })])
        ],
        intro: `${doc.tag} is a text primitive with a content-only API.`
      };
    case "icon":
      return {
        groups: [
          propertyGroup([
            apiItem("name", "Lucide icon name to render.", { type: "string" }),
            apiItem("size", "Optional size override for the icon.", { type: "number | string" })
          ]),
          eventGroup([]),
          compositionGroup([])
        ],
        intro: `${doc.tag} is configured by icon name and optional sizing overrides.`
      };
    case "icon-button":
      return {
        groups: [
          propertyGroup([
            apiItem("label", "Accessible label for the icon-only button.", { defaultValue: `""`, type: "string" }),
            apiItem("name", "Lucide icon name to render.", { type: "string" }),
            apiItem("variant", "Switches between solid and ghost button treatments.", {
              defaultValue: `"solid"`,
              type: `"solid" | "ghost"`,
              values: `"solid", "ghost"`
            }),
            apiItem("disabled", "Disables activation.", { defaultValue: "false", type: "boolean" })
          ]),
          eventGroup([apiItem("click", "Uses the native click event from the internal button control.", { type: "MouseEvent" })]),
          compositionGroup([])
        ],
        intro: `${doc.tag} keeps the same action model as emb-button, but its public API is specialized for icon-only affordances.`
      };
    case "link":
      return {
        groups: [
          propertyGroup([
            apiItem("href", "Destination URL or hash.", { type: "string" }),
            apiItem("target / rel", "Standard target and rel attributes are passed through to the underlying anchor.", { type: "string attributes" })
          ]),
          eventGroup([apiItem("click", "Uses the native click/navigation behavior of an anchor.", { type: "MouseEvent" })]),
          compositionGroup([apiItem("default slot", "Default slot content becomes the link label.", { type: "slot" })])
        ],
        intro: `${doc.tag} is intentionally thin. Its API stays close to a native anchor so it works in generic web-component consumers.`
      };
    case "listbox":
      return {
        groups: [
          propertyGroup([
            apiItem("selected-value", "Currently selected option value.", { defaultValue: `""`, type: "string" }),
            apiItem("active-index", "Current keyboard-active option index.", { defaultValue: "0", type: "number" })
          ]),
          eventGroup([
            apiItem("input", "Fires as the selected option changes.", { type: "Event" }),
            apiItem("change", "Fires when option selection is committed.", { type: "Event" })
          ]),
          compositionGroup([apiItem("default slot", "Provide one or more emb-option children.", { type: "slot" })])
        ],
        intro: `${doc.tag} coordinates keyboard and selection state across slotted options.`
      };
    case "menu":
      return {
        groups: [
          propertyGroup([]),
          eventGroup([]),
          compositionGroup([apiItem("default slot", "Provide emb-menu-item children for the actionable rows.", { type: "slot" })])
        ],
        intro: `${doc.tag} is a composition container for menu items rather than a property-heavy component.`
      };
    case "menu-item":
      return {
        groups: [
          propertyGroup([apiItem("disabled", "Disables menu item activation.", { defaultValue: "false", type: "boolean" })]),
          eventGroup([apiItem("click", "Uses native click or selection handling from the parent menu surface.", { type: "MouseEvent" })]),
          compositionGroup([apiItem("default slot", "Default slot content becomes the item label.", { type: "slot" })])
        ],
        intro: `${doc.tag} is usually consumed inside emb-menu or emb-dropdown-menu, where click handling is delegated to the parent workflow.`
      };
    case "meter":
    case "progress":
      return {
        groups: [
          propertyGroup([
            apiItem("value", "Current measured value.", { type: "number" }),
            apiItem("max", "Upper bound of the measurement.", { type: "number" }),
            apiItem("min", "Lower bound when supported by the native element.", { type: "number" })
          ]),
          eventGroup([]),
          compositionGroup([apiItem("default slot", "Default slot content can provide an accessible textual summary when supported.", { type: "slot" })])
        ],
        intro: `${doc.tag} follows the native scalar-indicator model: set numeric values and let the browser expose semantics.`
      };
    case "option":
      return {
        groups: [
          propertyGroup([
            apiItem("value", "Programmatic value for the option.", { defaultValue: `""`, type: "string" }),
            apiItem("label", "Label text used by parent selection components.", { defaultValue: `""`, type: "string" }),
            apiItem("disabled", "Disables selection.", { defaultValue: "false", type: "boolean" }),
            apiItem("selected", "Marks the option as selected.", { defaultValue: "false", type: "boolean" })
          ]),
          eventGroup([apiItem("option-select", "Fires when the option is selected by the user.", { type: "CustomEvent<{ value?: string }>" })]),
          compositionGroup([apiItem("default slot", "Default slot content becomes the visible option body.", { type: "slot" })])
        ],
        intro: `${doc.tag} is the row primitive behind listbox-style selection.`
      };
    case "pagination":
      return {
        groups: [
          propertyGroup([
            apiItem("current-page", "Current active page.", { type: "number" }),
            apiItem("total-pages", "Total number of pages.", { type: "number" })
          ]),
          eventGroup([
            apiItem("input", "Fires as the current page changes.", { type: "Event" }),
            apiItem("change", "Fires when page navigation is committed.", { type: "Event" })
          ]),
          compositionGroup([])
        ],
        intro: `${doc.tag} exposes a compact value API: current page, total pages, and change events for navigation.`
      };
    case "popover":
    case "drawer":
    case "tooltip":
      return overlayApi([], [], [apiItem("default slot", "Provide the overlay body content through the default slot.", { type: "slot" })]);
    case "rating-input":
      return {
        groups: [
          propertyGroup([
            apiItem("value", "Current rating value.", { type: "number | string" }),
            apiItem("name", "Associates the control with a form field name.", { defaultValue: `""`, type: "string" }),
            apiItem("disabled", "Disables interaction.", { defaultValue: "false", type: "boolean" })
          ]),
          eventGroup([
            apiItem("input", "Fires as the rating changes.", { type: "Event" }),
            apiItem("change", "Fires when the rating is committed.", { type: "Event" })
          ]),
          compositionGroup([])
        ],
        intro: `${doc.tag} exposes a single rating value backed by native selection mechanics.`
      };
    case "segmented-control":
      return {
        groups: [
          propertyGroup([
            apiItem("options", "Array of option objects assigned as a property.", { defaultValue: "[]", type: "SegmentedControlOption[]" }),
            apiItem("value", "Current selected option value.", { defaultValue: `""`, type: "string" }),
            apiItem("name", "Associates the control with a form field name.", { defaultValue: `""`, type: "string" }),
            apiItem("disabled", "Disables interaction.", { defaultValue: "false", type: "boolean" })
          ]),
          eventGroup([
            apiItem("input", "Fires as the selected option changes.", { type: "Event" }),
            apiItem("change", "Fires when the selection is committed.", { type: "Event" })
          ]),
          compositionGroup([])
        ],
        intro: `${doc.tag} is property-driven: assign options from JavaScript and bind to a single current value.`
      };
    case "stepper":
      return {
        groups: [
          propertyGroup([
            apiItem("steps", "Array of step objects assigned as a property.", { defaultValue: "[]", type: "StepperStep[]" }),
            apiItem("value", "Current active step value.", { defaultValue: `""`, type: "string" }),
            apiItem("interactive", "Enables click-based step selection.", { defaultValue: "false", type: "boolean" }),
            apiItem("orientation", "Switches between horizontal and vertical layout.", {
              defaultValue: `"horizontal"`,
              type: `"horizontal" | "vertical"`,
              values: `"horizontal", "vertical"`
            }),
            apiItem("disabled", "Disables interactive step changes.", { defaultValue: "false", type: "boolean" })
          ]),
          eventGroup([
            apiItem("input", "Fires as the active step changes.", { type: "Event" }),
            apiItem("change", "Fires when step selection is committed.", { type: "Event" })
          ]),
          compositionGroup([])
        ],
        intro: `${doc.tag} is state-driven. Most integrations assign a steps array and bind the current value for workflow navigation.`
      };
    case "tabs":
      return {
        groups: [
          propertyGroup([apiItem("value", "Current active tab value.", { defaultValue: `""`, type: "string" })]),
          eventGroup([
            apiItem("input", "Fires as the active tab changes.", { type: "Event" }),
            apiItem("change", "Fires when the tab change is committed.", { type: "Event" })
          ]),
          compositionGroup([apiItem("tab children", "Compose tab triggers and panels using the documented child structure for the component.", { type: "child elements" })])
        ],
        intro: `${doc.tag} exposes a single active value and relies on composition for the rest of the tab structure.`
      };
    case "toast":
      return overlayApi(
        [apiItem("tone", "Visual message tone such as success, warning, or danger.", {
          defaultValue: `"info"`,
          type: `"info" | "success" | "warning" | "danger"`,
          values: `"info", "success", "warning", "danger"`
        })],
        [],
        [apiItem("default slot", "Default slot content becomes the toast body.", { type: "slot" })]
      );
    case "toast-region":
      return {
        groups: [
          propertyGroup([]),
          eventGroup([]),
          compositionGroup([apiItem("host region", "Acts as the app-level host for imperatively managed toast instances.", { type: "application host" })])
        ],
        intro: `${doc.tag} is an application host rather than a frequently hand-authored element.`
      };
    case "toolbar":
      return {
        groups: [
          propertyGroup([]),
          eventGroup([apiItem("focus / keyboard events", "Relies on native focus and keyboard interaction across slotted child controls.", { type: "native DOM events" })]),
          compositionGroup([apiItem("default slot", "Provide buttons, button groups, or other interactive child controls in the default slot.", { type: "slot" })])
        ],
        intro: `${doc.tag} is mostly about semantics and roving focus across grouped child actions.`
      };
    default:
      return {
        groups: [
          propertyGroup([]),
          eventGroup([]),
          compositionGroup([apiItem("custom element usage", `Start by using <code>${doc.tag}</code> directly and layering adjacent Emberline primitives around it as needed.`, { type: "custom element" })])
        ],
        intro: `${doc.tag} does not need a large wrapper-specific surface in the docs. Its main integration point is the custom element itself.`
      };
  }
}

function openPalette(): void {
  root.querySelector<CommandPaletteHost>("#docs-command-palette")?.show();
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtml(value: string): string {
  return escapeAttribute(value);
}
