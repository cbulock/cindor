import "cindor-ui-core/register";
import "cindor-ui-core/styles.css";
import "./app.css";
import componentDocsData from "../../../packages/core/component-docs.json";

import type { CommandPaletteCommand, FilterBuilderField, SegmentedControlOption, StepperStep } from "cindor-ui-core";

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

type FilterBuilderHost = HTMLElement & {
  fields: FilterBuilderField[];
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

const quickStartCode = `import "cindor-ui-core/styles.css";
import "cindor-ui-core/register";

const form = document.querySelector("form");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
});`;

const installCode = `npm install cindor-ui-core`;
const reactInstallCode = `npm install cindor-ui-core cindor-ui-react`;
const vueInstallCode = `npm install cindor-ui-core cindor-ui-vue`;
const reactQuickStartCode = `import { useState } from "react";
import "cindor-ui-core/styles.css";
import {
  CindorButton,
  CindorFormField,
  CindorInput,
  CindorProvider
} from "cindor-ui-react";

export function App() {
  const [projectName, setProjectName] = useState("Q2 launch");

  return (
    <CindorProvider theme="dark">
      <main style={{ padding: "var(--space-6)" }}>
        <CindorFormField label="Project name" description="Shown in the workspace switcher.">
          <CindorInput
            value={projectName}
            onInput={(event) => setProjectName((event.currentTarget as HTMLInputElement).value)}
          />
        </CindorFormField>

        <CindorButton style={{ marginTop: "var(--space-4)" }}>
          Save {projectName}
        </CindorButton>
      </main>
    </CindorProvider>
  );
}`;
const vueQuickStartCode = `<script setup lang="ts">
import { ref } from "vue";
import "cindor-ui-core/styles.css";
import {
  CindorButton,
  CindorFormField,
  CindorInput,
  CindorProvider
} from "cindor-ui-vue";

const projectName = ref("Q2 launch");
</script>

<template>
  <CindorProvider theme="dark">
    <main style="padding: var(--space-6);">
      <CindorFormField label="Project name" description="Shown in the workspace switcher.">
        <CindorInput v-model="projectName" />
      </CindorFormField>

      <CindorButton style="margin-top: var(--space-4);">
        Save {{ projectName }}
      </CindorButton>
    </main>
  </CindorProvider>
</template>`;

const dataTableSampleRows = [
  { id: "1", component: "cindor-button", layer: "Primitive", use: "Actions", actions: "Edit, Open" },
  { id: "2", component: "cindor-form-field", layer: "Composite", use: "Forms", actions: "Inspect, Duplicate" },
  { id: "3", component: "cindor-command-palette", layer: "Component", use: "Workflows", actions: "Launch" }
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

const filterBuilderDemoFields: FilterBuilderField[] = [
  {
    label: "Status",
    options: [
      { label: "Open", value: "open" },
      { label: "Closed", value: "closed" },
      { label: "Escalated", value: "escalated" }
    ],
    type: "select",
    value: "status"
  },
  {
    label: "Priority",
    options: [
      { label: "High", value: "high" },
      { label: "Medium", value: "medium" },
      { label: "Low", value: "low" }
    ],
    type: "select",
    value: "priority"
  },
  {
    label: "Owner",
    placeholder: "Teammate name",
    type: "text",
    value: "owner"
  }
];

const filterBuilderPreviewValue = JSON.stringify({
  children: [
    {
      field: "status",
      id: "rule-0",
      operator: "is",
      type: "rule",
      value: "open"
    },
    {
      children: [
        {
          field: "priority",
          id: "rule-1",
          operator: "is",
          type: "rule",
          value: "high"
        },
        {
          field: "owner",
          id: "rule-2",
          operator: "contains",
          type: "rule",
          value: "Cam"
        }
      ],
      id: "group-1",
      logic: "or",
      type: "group"
    }
  ],
  id: "group-0",
  logic: "and",
  type: "group"
});

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

    <cindor-command-palette id="docs-command-palette" title="Cindor docs"></cindor-command-palette>
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
        <strong>Cindor UI docs</strong>
        <span class="eyebrow">Technical reference for the Cindor component library.</span>
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
      <cindor-card>
        <div class="card-body">
          <strong>${componentCatalog.length} documented components</strong>
          <p class="muted">The docs catalog mirrors the current registered Cindor component surface.</p>
        </div>
      </cindor-card>
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
      <cindor-button data-action="open-palette" variant="ghost">Open command palette</cindor-button>
      <cindor-alert tone="info">
        This site imports the same cindor-ui-core source surfaces consumers use.
      </cindor-alert>
    </div>
  `;
}

function renderHome(activeSectionId: string): string {
  return `
    <section class="hero" id="overview">
      <div class="hero-copy">
        <cindor-breadcrumbs>
          <a href="#overview">Cindor UI</a>
          <a href="#getting-started">Documentation</a>
        </cindor-breadcrumbs>
        <h1 class="hero-title">Cindor UI technical reference.</h1>
        <p class="muted">
          Cindor UI keeps behavior in a standards-based custom element core and exposes thin React and Vue adapters. This docs app uses the web-component layer directly so examples stay close to the primary integration surface.
        </p>
      </div>

      <div class="hero-actions">
        <cindor-button data-target-section="getting-started">Installation</cindor-button>
        <cindor-button variant="ghost" data-target-section="components">Component catalog</cindor-button>
        <cindor-button variant="ghost" data-target-section="patterns">Composition patterns</cindor-button>
      </div>

      <div class="card-grid">
        <cindor-card>
          <div class="card-body">
            <h3>Native-first primitives</h3>
            <p class="muted">Prefer platform elements where they fit: buttons, inputs, selects, textareas, dialog, tables, and form semantics.</p>
          </div>
        </cindor-card>
        <cindor-card>
          <div class="card-body">
            <h3>Stable integration surface</h3>
            <p class="muted">Consumers work with attributes, properties, slots, composed events, and CSS custom properties instead of framework-only APIs.</p>
          </div>
        </cindor-card>
        <cindor-card>
          <div class="card-body">
            <h3>Complete component reference</h3>
            <p class="muted">Each registered component has a dedicated docs route with usage snippets, facts, and component-specific notes.</p>
          </div>
        </cindor-card>
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
            <cindor-code-block code="${escapeAttribute(installCode)}" language="bash"></cindor-code-block>
            <cindor-code-block code="${escapeAttribute(quickStartCode)}" language="ts"></cindor-code-block>
          </div>
          <div class="preview-block">
            <strong>React</strong>
            <p class="muted">The React package wraps the same core elements and registers them for you, so usage stays close to standard JSX patterns.</p>
            <cindor-code-block code="${escapeAttribute(reactInstallCode)}" language="bash"></cindor-code-block>
            <cindor-code-block code="${escapeAttribute(reactQuickStartCode)}" language="tsx"></cindor-code-block>
          </div>
          <div class="preview-block">
            <strong>Vue</strong>
            <p class="muted">The Vue package exposes thin component wrappers over the same custom element implementation and shared styles.</p>
            <cindor-code-block code="${escapeAttribute(vueInstallCode)}" language="bash"></cindor-code-block>
            <cindor-code-block code="${escapeAttribute(vueQuickStartCode)}" language="vue"></cindor-code-block>
          </div>
        </div>

        <div class="preview-block">
          <div class="live-toolbar">
            <strong>Setup flow</strong>
            <cindor-badge>Interactive example</cindor-badge>
          </div>
          <cindor-stepper id="setup-stepper" aria-label="Getting started steps" interactive></cindor-stepper>
        </div>

        <div class="preview-block">
          <strong>Quick form composition</strong>
          <p class="muted">Scope a theme locally and compose reusable layout regions without introducing framework-specific provider APIs.</p>
          <cindor-provider theme="dark">
            <cindor-layout>
              <cindor-layout-header>
                <cindor-stack gap="2">
                  <strong>New workspace</strong>
                  <p class="muted">The provider and layout primitives stay close to standard web-component composition.</p>
                </cindor-stack>
              </cindor-layout-header>
              <cindor-layout-content>
                <cindor-form description="Create a workspace without leaving native form patterns.">
                  <form onsubmit="event.preventDefault()">
                    <cindor-form-row>
                      <cindor-form-field label="Project name" description="Shown to workspace members." required>
                        <cindor-input name="projectName" placeholder="Cindor Docs" required></cindor-input>
                      </cindor-form-field>
                      <cindor-form-field label="Owner email" description="Used for release notifications." required>
                        <cindor-email-input name="ownerEmail" placeholder="owner@example.com" required></cindor-email-input>
                      </cindor-form-field>
                    </cindor-form-row>
                    <cindor-stack direction="horizontal" gap="2" wrap>
                      <cindor-button type="reset" variant="ghost">Cancel</cindor-button>
                      <cindor-button type="submit">Create project</cindor-button>
                    </cindor-stack>
                  </form>
                </cindor-form>
              </cindor-layout-content>
            </cindor-layout>
          </cindor-provider>
        </div>
      </section>

      <section class="section" id="components" data-active-section="${String(activeSectionId === "components")}">
        <div class="section-heading">
          <h2>Component reference</h2>
          <p>The catalog covers the current Cindor component surface and links directly to a dedicated docs view for each component.</p>
        </div>

        <div class="catalog-controls">
          <cindor-search id="catalog-search" placeholder="Search components by name, category, or summary" value="${escapeAttribute(catalogQuery)}"></cindor-search>
          <cindor-segmented-control id="catalog-layer-filter" aria-label="Filter by component layer"></cindor-segmented-control>
        </div>

        ${renderCatalogContent()}

        <div class="demo-grid">
          <div class="preview-block">
            <strong>Scheduling</strong>
            <p class="muted">Calendar and related date selection stay usable as standard web components.</p>
            <cindor-calendar month="2026-04" range start-value="2026-04-12" end-value="2026-04-18"></cindor-calendar>
          </div>
          <div class="preview-block">
            <strong>Uploads</strong>
            <p class="muted">Dropzone composes native file selection and drag/drop affordances.</p>
            <cindor-dropzone multiple accept=".png,.jpg,.pdf"></cindor-dropzone>
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
              <strong>Layout primitives</strong>
              <cindor-badge>New</cindor-badge>
            </div>
            <cindor-provider theme="dark">
              <cindor-layout>
                <cindor-layout-header>
                  <cindor-stack gap="2">
                    <strong>Release workspace</strong>
                    <cindor-stack direction="horizontal" gap="2" wrap align="center">
                      <cindor-badge tone="accent">Production</cindor-badge>
                      <cindor-button>Deploy</cindor-button>
                      <cindor-button variant="ghost">Share</cindor-button>
                    </cindor-stack>
                  </cindor-stack>
                </cindor-layout-header>
                <cindor-layout-content>
                  <div class="callout">
                    <cindor-alert id="pattern-alert" tone="${activeAlertTone}">
                      Compose higher-level patterns from reusable primitives instead of duplicating behavior in each component.
                    </cindor-alert>
                  </div>
                </cindor-layout-content>
              </cindor-layout>
            </cindor-provider>
          </div>

          <div class="preview-block">
            <div class="live-toolbar">
              <strong>Search-first navigation</strong>
              <cindor-badge>Dogfooded</cindor-badge>
            </div>
            <p class="muted">The docs command palette is built from Cindor's dialog, search, listbox, and option components.</p>
            <cindor-button data-action="open-palette">Jump with command palette</cindor-button>
          </div>

          <div class="preview-block">
            <div class="live-toolbar">
              <strong>Form orchestration</strong>
              <cindor-badge>New surface</cindor-badge>
            </div>
            <p class="muted">cindor-form adds validation summaries and submission state without replacing the native form element your app already uses.</p>
            <cindor-form description="Try submitting with empty fields to see the orchestration layer wire into cindor-form-field messaging.">
              <form onsubmit="event.preventDefault()">
                <cindor-form-row>
                  <cindor-form-field label="Workspace name" required>
                    <cindor-input name="workspaceName" required></cindor-input>
                  </cindor-form-field>
                  <cindor-form-field label="Billing email" required>
                    <cindor-email-input name="billingEmail" required></cindor-email-input>
                  </cindor-form-field>
                </cindor-form-row>
                <cindor-button type="submit">Validate form</cindor-button>
              </form>
            </cindor-form>
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
      <cindor-empty-state>
        <div class="card-body">
          <h3>No components match that filter</h3>
          <p class="muted">Try a broader search term or switch the current layer filter.</p>
        </div>
      </cindor-empty-state>
    `;
  }

  const groups = groupComponentsByCategory(filtered);

  return `
    <div class="catalog-summary">
      <cindor-badge tone="accent">${filtered.length} result${filtered.length === 1 ? "" : "s"}</cindor-badge>
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
      <cindor-card>
        <div class="card-body">
          <div class="component-meta">
            <cindor-badge tone="accent">${doc.layer}</cindor-badge>
            <cindor-badge>${doc.category}</cindor-badge>
          </div>
          <h3>${doc.title}</h3>
          <p class="muted">${doc.summary}</p>
          <div class="component-inline-meta">
            <code>${doc.tag}</code>
            <span>${doc.nativeFoundation}</span>
          </div>
        </div>
      </cindor-card>
    </a>
  `;
}

function renderComponentDetail(slug: string): string {
  const doc = getComponentDoc(slug);
  if (!doc) {
    return `
      <section class="section">
        <cindor-empty-state>
          <div class="card-body">
            <h2>Component not found</h2>
            <p class="muted">That docs route does not match the current Cindor component catalog.</p>
            <cindor-button data-target-section="components">Back to component catalog</cindor-button>
          </div>
        </cindor-empty-state>
      </section>
    `;
  }

  const related = componentCatalog.filter((component) => component.category === doc.category && component.slug !== doc.slug).slice(0, 4);
  const api = getComponentApi(doc);

  return `
    <section class="component-page">
      <div class="component-page-header">
        <cindor-breadcrumbs>
          <a href="#overview">Cindor UI</a>
          <a href="#components">Components</a>
          <a href="#components/${doc.slug}">${doc.title}</a>
        </cindor-breadcrumbs>

        <div class="component-page-copy">
          <div class="component-meta">
            <cindor-badge tone="accent">${doc.layer}</cindor-badge>
            <cindor-badge>${doc.category}</cindor-badge>
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
              <cindor-code-block code="${escapeAttribute(getUsageCode(doc))}" language="html"></cindor-code-block>
            </div>
            <div class="preview-block">
              <strong>React</strong>
              <p class="muted">Import the generated React wrapper when you want JSX ergonomics but the same underlying Cindor behavior.</p>
              <cindor-code-block code="${escapeAttribute(getReactUsageCode(doc))}" language="tsx"></cindor-code-block>
            </div>
            <div class="preview-block">
              <strong>Vue</strong>
              <p class="muted">Use the Vue wrapper when you want template-first usage while keeping the core component contract aligned with the custom element.</p>
              <cindor-code-block code="${escapeAttribute(getVueUsageCode(doc))}" language="vue"></cindor-code-block>
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
    <cindor-card>
      <div class="card-body">
        <span class="eyebrow">${label}</span>
        <strong>${value}</strong>
      </div>
    </cindor-card>
  `;
}

function renderComponentPreview(doc: ComponentDoc): string {
  const previewMarkup = getPreviewMarkup(doc);
  if (!previewMarkup) {
    return `
      <cindor-alert tone="info">
        ${getPreviewFallbackText(doc)}
      </cindor-alert>
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

  if (slug === "filter-builder") {
    const filterBuilder = root.querySelector<FilterBuilderHost>('[data-component-preview="filter-builder"] #filter-builder-preview');
    if (filterBuilder) {
      filterBuilder.fields = filterBuilderDemoFields;
      filterBuilder.value = filterBuilderPreviewValue;
    }
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
      return `<cindor-alert tone="info">Update complete.</cindor-alert>`;
    case "activity-feed":
      return `<cindor-activity-feed>
  <cindor-activity-item unread>
    <cindor-avatar slot="leading" name="Ops"></cindor-avatar>
    <span slot="title">Database failover completed</span>
    <span slot="timestamp">5 minutes ago</span>
    <span slot="meta">Primary cluster</span>
    Connections were restored automatically after the failover.
  </cindor-activity-item>
</cindor-activity-feed>`;
    case "activity-item":
      return `<cindor-activity-feed>
  <cindor-activity-item unread>
    <cindor-avatar slot="leading" name="Ops"></cindor-avatar>
    <span slot="title">Database failover completed</span>
    <span slot="timestamp">5 minutes ago</span>
    <span slot="meta">Primary cluster</span>
    Connections were restored automatically after the failover.
  </cindor-activity-item>
</cindor-activity-feed>`;
    case "autocomplete":
      return `<cindor-autocomplete placeholder="Search people"></cindor-autocomplete>`;
    case "avatar":
      return `<cindor-avatar name="Cindor Line"></cindor-avatar>`;
    case "badge":
      return `<cindor-badge tone="accent">Beta</cindor-badge>`;
    case "breadcrumbs":
      return `<cindor-breadcrumbs>
  <a href="/">Home</a>
  <a href="/docs">Docs</a>
  <a href="/docs/components">Components</a>
</cindor-breadcrumbs>`;
    case "button":
      return `<cindor-button>Save changes</cindor-button>`;
    case "button-group":
      return `<cindor-button-group attached>
  <cindor-button variant="ghost">Back</cindor-button>
  <cindor-button>Continue</cindor-button>
</cindor-button-group>`;
    case "calendar":
      return `<cindor-calendar month="2026-04" value="2026-04-26"></cindor-calendar>`;
    case "card":
      return `<cindor-card>
  <div style="padding: var(--space-4);">Card content</div>
</cindor-card>`;
    case "checkbox":
      return `<cindor-checkbox>Enable email updates</cindor-checkbox>`;
    case "chip":
      return `<cindor-chip>UI System</cindor-chip>`;
    case "tag":
      return `<cindor-tag tone="accent" dismissible>Critical</cindor-tag>`;
    case "code-block":
      return `<cindor-code-block code="const ready = true;" language="ts"></cindor-code-block>`;
    case "color-input":
      return `<cindor-color-input value="#4f46e5"></cindor-color-input>`;
    case "combobox":
      return `<cindor-combobox placeholder="Choose a role">
  <option value="designer">Designer</option>
  <option value="engineer">Engineer</option>
  <option value="pm">Product manager</option>
</cindor-combobox>`;
    case "command-bar":
      return `<cindor-command-bar label="Bulk actions" description="Apply actions to the current selection." count="3">
  <span>Selection updates are applied immediately.</span>
  <cindor-button slot="actions" variant="ghost">Clear</cindor-button>
  <cindor-button slot="actions">Archive</cindor-button>
</cindor-command-bar>`;
    case "command-palette":
      return `<cindor-command-palette title="Workspace commands"></cindor-command-palette>`;
    case "context-menu":
      return `<cindor-context-menu>
  <div slot="trigger">Right click for actions</div>
  <cindor-menu-item>Rename</cindor-menu-item>
  <cindor-menu-item>Duplicate</cindor-menu-item>
</cindor-context-menu>`;
    case "data-table":
      return `<cindor-data-table id="component-table" caption="Components"></cindor-data-table>

<script type="module">
  const table = document.querySelector("#component-table");

  table.columns = [
    { key: "component", label: "Component", sortable: true },
    { key: "layer", label: "Layer" },
    { key: "use", label: "Use" },
    {
      key: "actions",
      label: "Actions",
      actions: [
        { key: "open", label: "", icon: "arrow-up-right" },
        { key: "edit", label: "Edit", icon: "pencil" }
      ]
    }
  ];

  table.rows = [
    { id: "1", component: "cindor-button", layer: "Primitive", use: "Actions" },
    { id: "2", component: "cindor-form-field", layer: "Composite", use: "Forms" }
  ];

  table.addEventListener("row-action", (event) => {
    console.log(event.detail.actionKey, event.detail.row);
  });
</script>`;
    case "date-picker":
      return `<cindor-date-picker month="2026-04" value="2026-04-26"></cindor-date-picker>`;
    case "date-range-picker":
      return `<cindor-date-range-picker month="2026-04" start-value="2026-04-12" end-value="2026-04-18"></cindor-date-range-picker>`;
    case "date-time-picker":
      return `<cindor-date-time-picker value="2026-04-28T09:30"></cindor-date-time-picker>`;
    case "date-input":
      return `<cindor-date-input value="2026-04-26"></cindor-date-input>`;
    case "description-item":
      return `<cindor-description-list>
  <cindor-description-item>
    <span slot="term">Status</span>
    Healthy
  </cindor-description-item>
</cindor-description-list>`;
    case "description-list":
      return `<cindor-description-list>
  <cindor-description-item>
    <span slot="term">Status</span>
    Healthy
  </cindor-description-item>
  <cindor-description-item>
    <span slot="term">Region</span>
    us-east-1
  </cindor-description-item>
</cindor-description-list>`;
    case "dialog":
      return `<cindor-dialog open>
  <h2>Confirm action</h2>
  <p>Save current changes?</p>
</cindor-dialog>`;
    case "divider":
      return `<cindor-divider></cindor-divider>`;
    case "drawer":
      return `<cindor-drawer open>
  <h2>Preferences</h2>
  <p>Adjust workspace settings.</p>
</cindor-drawer>`;
    case "dropdown-menu":
      return `<cindor-dropdown-menu>
  <cindor-menu-item>Rename</cindor-menu-item>
  <cindor-menu-item>Duplicate</cindor-menu-item>
</cindor-dropdown-menu>`;
    case "dropzone":
      return `<cindor-dropzone multiple accept=".png,.jpg,.pdf"></cindor-dropzone>`;
    case "email-input":
      return `<cindor-email-input value="hello@example.com"></cindor-email-input>`;
    case "empty-state":
      return `<cindor-empty-state>
  <h3>No projects yet</h3>
  <p>Create your first workspace to get started.</p>
</cindor-empty-state>`;
    case "empty-search-results":
      return `<cindor-empty-search-results query="access policy">
  <ul>
    <li>Check spelling or abbreviations.</li>
    <li>Remove one or more filters.</li>
  </ul>
  <cindor-button slot="actions" variant="ghost">Reset filters</cindor-button>
  <cindor-button slot="actions">Create saved search</cindor-button>
</cindor-empty-search-results>`;
    case "error-text":
      return `<cindor-error-text>Please enter a valid email address.</cindor-error-text>`;
    case "fieldset":
      return `<cindor-fieldset legend="Notifications">
  <cindor-checkbox>Email</cindor-checkbox>
  <cindor-checkbox>Push</cindor-checkbox>
</cindor-fieldset>`;
    case "file-input":
      return `<cindor-file-input multiple accept=".pdf,.png"></cindor-file-input>`;
    case "filter-builder":
      return `<cindor-filter-builder id="team-filter-builder"></cindor-filter-builder>
<script type="module">
  const builder = document.querySelector("#team-filter-builder");
  builder.fields = ${JSON.stringify(filterBuilderDemoFields, null, 2)};
  builder.value = ${JSON.stringify(filterBuilderPreviewValue)};
</script>`;
    case "form":
      return `<cindor-form description="Create a workspace with shared field and validation wiring.">
  <form onsubmit="event.preventDefault()">
    <cindor-form-row>
      <cindor-form-field label="Project name" required>
        <cindor-input name="projectName" required></cindor-input>
      </cindor-form-field>
      <cindor-form-field label="Owner email" required>
        <cindor-email-input name="ownerEmail" required></cindor-email-input>
      </cindor-form-field>
    </cindor-form-row>
    <cindor-button type="submit">Create project</cindor-button>
  </form>
</cindor-form>`;
    case "form-field":
      return `<cindor-form-field label="Project name" description="Shown to your teammates.">
  <cindor-input></cindor-input>
</cindor-form-field>`;
    case "form-row":
      return `<cindor-form-row>
  <cindor-form-field label="First name">
    <cindor-input></cindor-input>
  </cindor-form-field>
  <cindor-form-field label="Last name">
    <cindor-input></cindor-input>
  </cindor-form-field>
</cindor-form-row>`;
    case "helper-text":
      return `<cindor-helper-text>Used for keyboard shortcuts and system labels.</cindor-helper-text>`;
    case "icon":
      return `<cindor-icon name="sparkles"></cindor-icon>`;
    case "icon-button":
      return `<cindor-icon-button label="Search" name="search"></cindor-icon-button>`;
    case "input":
      return `<cindor-input placeholder="Project name"></cindor-input>`;
    case "inline-edit":
      return `<cindor-inline-edit value="Quarterly roadmap"></cindor-inline-edit>`;
    case "layout":
      return `<cindor-layout>
  <cindor-layout-header>
    <h2>Release overview</h2>
  </cindor-layout-header>
  <cindor-layout-content>
    <cindor-card>
      <div style="padding: var(--space-4);">Primary content</div>
    </cindor-card>
  </cindor-layout-content>
</cindor-layout>`;
    case "layout-content":
      return `<cindor-layout-content>
  <cindor-card>
    <div style="padding: var(--space-4);">Primary content</div>
  </cindor-card>
</cindor-layout-content>`;
    case "layout-header":
      return `<cindor-layout-header>
  <cindor-breadcrumbs>
    <a href="/">Home</a>
    <a href="/releases">Releases</a>
  </cindor-breadcrumbs>
  <h2>Release overview</h2>
</cindor-layout-header>`;
    case "link":
      return `<cindor-link href="#components">Browse components</cindor-link>`;
    case "listbox":
      return `<cindor-listbox selected-value="design">
  <cindor-option value="design">Designer</cindor-option>
  <cindor-option value="engineering">Engineer</cindor-option>
</cindor-listbox>`;
    case "menu":
      return `<cindor-menu>
  <cindor-menu-item>Rename</cindor-menu-item>
  <cindor-menu-item>Archive</cindor-menu-item>
</cindor-menu>`;
    case "menu-item":
      return `<cindor-menu>
  <cindor-menu-item>Open settings</cindor-menu-item>
</cindor-menu>`;
    case "menubar":
      return `<cindor-menubar aria-label="Application menu">
  <cindor-button variant="ghost">File</cindor-button>
  <cindor-button variant="ghost">Edit</cindor-button>
  <cindor-button variant="ghost">View</cindor-button>
</cindor-menubar>`;
    case "meter":
      return `<cindor-meter min="0" max="100" low="25" high="75" optimum="90" value="72">72%</cindor-meter>`;
    case "multi-select":
      return `<cindor-multi-select placeholder="Choose a role">
  <cindor-option selected value="designer">Designer</cindor-option>
  <cindor-option value="engineer">Engineer</cindor-option>
  <cindor-option value="pm">Product manager</cindor-option>
</cindor-multi-select>`;
    case "navigation-rail":
      return `<cindor-navigation-rail aria-label="Workspace sections">
  <cindor-navigation-rail-item href="#home" label="Home" current>
    <cindor-icon slot="start" name="house"></cindor-icon>
  </cindor-navigation-rail-item>
  <cindor-navigation-rail-item href="#projects" label="Projects">
    <cindor-icon slot="start" name="folder-kanban"></cindor-icon>
  </cindor-navigation-rail-item>
</cindor-navigation-rail>`;
    case "navigation-rail-item":
      return `<cindor-navigation-rail-item href="#home" label="Home" current>
  <cindor-icon slot="start" name="house"></cindor-icon>
</cindor-navigation-rail-item>`;
    case "number-input":
      return `<cindor-number-input value="12"></cindor-number-input>`;
    case "option":
      return `<cindor-listbox>
  <cindor-option selected value="design">Designer</cindor-option>
</cindor-listbox>`;
    case "pagination":
      return `<cindor-pagination current-page="3" total-pages="12"></cindor-pagination>`;
    case "password-input":
      return `<cindor-password-input value="supersecret"></cindor-password-input>`;
    case "page-header":
      return `<cindor-page-header
  eyebrow="Workspace"
  title="Release overview"
  description="Track deployment health, incidents, and pending approvals."
>
  <cindor-breadcrumbs slot="breadcrumbs">
    <a href="/">Home</a>
    <a href="/workspaces">Workspaces</a>
    <a href="/releases">Releases</a>
  </cindor-breadcrumbs>
  <cindor-badge slot="meta" tone="accent">Production</cindor-badge>
  <cindor-button slot="actions">Deploy</cindor-button>
</cindor-page-header>`;
    case "panel-inspector":
      return `<cindor-panel-inspector title="Deployment details" description="Review metadata and release health.">
  <cindor-badge slot="meta" tone="accent">Healthy</cindor-badge>
  <cindor-button slot="actions" variant="ghost">Open logs</cindor-button>
  <cindor-description-list>
    <cindor-description-item>
      <span slot="term">Version</span>
      2026.04.28-1
    </cindor-description-item>
  </cindor-description-list>
  <div slot="footer">Last updated 4 minutes ago by Release Bot.</div>
</cindor-panel-inspector>`;
    case "popover":
      return `<cindor-popover open>
  <p>Supplemental information anchored to a trigger.</p>
</cindor-popover>`;
    case "progress":
      return `<cindor-progress max="100" value="68">68%</cindor-progress>`;
    case "provider":
      return `<cindor-provider theme="dark">
  <cindor-card>
    <div style="padding: var(--space-4);">Scoped theme boundary</div>
  </cindor-card>
</cindor-provider>`;
    case "radio":
      return `<cindor-radio name="plan">Pro</cindor-radio>`;
    case "range":
      return `<cindor-range min="0" max="100" value="40"></cindor-range>`;
    case "rating-input":
      return `<cindor-rating-input value="4"></cindor-rating-input>`;
    case "search":
      return `<cindor-search placeholder="Search docs"></cindor-search>`;
    case "segmented-control":
      return `<cindor-segmented-control></cindor-segmented-control>`;
    case "select":
      return `<cindor-select>
  <option>Starter</option>
  <option>Pro</option>
</cindor-select>`;
    case "skeleton":
      return `<cindor-skeleton></cindor-skeleton>`;
    case "side-nav":
      return `<cindor-side-nav aria-label="Documentation">
  <cindor-side-nav-item href="#overview" label="Overview"></cindor-side-nav-item>
  <cindor-side-nav-item expanded label="Guides">
    <cindor-side-nav-item href="#getting-started" label="Getting started" current></cindor-side-nav-item>
    <cindor-side-nav-item href="#theming" label="Theming"></cindor-side-nav-item>
  </cindor-side-nav-item>
</cindor-side-nav>`;
    case "side-nav-item":
      return `<cindor-side-nav-item expanded label="Guides">
  <cindor-side-nav-item href="#getting-started" label="Getting started"></cindor-side-nav-item>
</cindor-side-nav-item>`;
    case "splitter":
      return `<cindor-splitter style="height: 18rem;">
  <cindor-splitter-panel size="28">Navigation</cindor-splitter-panel>
  <cindor-splitter-panel size="72">Workspace</cindor-splitter-panel>
</cindor-splitter>`;
    case "splitter-panel":
      return `<cindor-splitter-panel size="30">Panel content</cindor-splitter-panel>`;
    case "spinner":
      return `<cindor-spinner></cindor-spinner>`;
    case "stack":
      return `<cindor-stack direction="horizontal" gap="2" wrap align="center">
  <cindor-badge tone="accent">Production</cindor-badge>
  <cindor-badge>12 services</cindor-badge>
  <cindor-button variant="ghost">Share</cindor-button>
</cindor-stack>`;
    case "stepper":
      return `<cindor-stepper></cindor-stepper>`;
    case "switch":
      return `<cindor-switch>Available for notifications</cindor-switch>`;
    case "tag-input":
      return `<cindor-tag-input placeholder="Add labels"></cindor-tag-input>`;
    case "stat-card":
      return `<cindor-stat-card label="Monthly recurring revenue" value="$84.2k" change="+12.4%" tone="positive">
  Compared with the previous 30 days.
</cindor-stat-card>`;
    case "tabs":
      return `<cindor-tabs value="overview" aria-label="Release sections">
  <cindor-tab-panel label="Overview" value="overview">Overview details</cindor-tab-panel>
  <cindor-tab-panel label="Activity" value="activity">Recent changes</cindor-tab-panel>
  <cindor-tab-panel label="Settings" value="settings">Configuration controls</cindor-tab-panel>
</cindor-tabs>`;
    case "tel-input":
      return `<cindor-tel-input value="+1 555 123 4567"></cindor-tel-input>`;
    case "textarea":
      return `<cindor-textarea rows="4">Notes</cindor-textarea>`;
    case "time-input":
      return `<cindor-time-input value="09:30"></cindor-time-input>`;
    case "timeline":
      return `<cindor-timeline>
  <cindor-timeline-item>
    <span slot="title">Project created</span>
    <span slot="timestamp">Apr 20</span>
    Initial workspace scaffolded.
  </cindor-timeline-item>
  <cindor-timeline-item>
    <span slot="title">Production launch</span>
    <span slot="timestamp">Today</span>
    Traffic is now routed to the new system.
  </cindor-timeline-item>
</cindor-timeline>`;
    case "timeline-item":
      return `<cindor-timeline>
  <cindor-timeline-item>
    <span slot="title">Deployed</span>
    <span slot="timestamp">2m ago</span>
    Release 1.2.0 shipped to production.
  </cindor-timeline-item>
</cindor-timeline>`;
    case "transfer-list":
      return `<cindor-transfer-list>
  <option value="design">Design</option>
  <option selected value="engineering">Engineering</option>
  <option value="product">Product</option>
  <option value="support">Support</option>
</cindor-transfer-list>`;
    case "toast":
      return `<cindor-toast open tone="success">Saved successfully.</cindor-toast>`;
    case "toast-region":
      return `<cindor-toast-region></cindor-toast-region>`;
    case "toolbar":
      return `<cindor-toolbar aria-label="Formatting actions">
  <cindor-button-group attached>
    <cindor-button variant="ghost">Bold</cindor-button>
    <cindor-button variant="ghost">Italic</cindor-button>
  </cindor-button-group>
</cindor-toolbar>`;
    case "tree-item":
      return `<cindor-tree-item label="Guides" expanded>
  <cindor-tree-item label="Getting started"></cindor-tree-item>
</cindor-tree-item>`;
    case "tree-view":
      return `<cindor-tree-view>
  <cindor-tree-item label="Overview"></cindor-tree-item>
  <cindor-tree-item label="Guides" expanded>
    <cindor-tree-item label="Getting started"></cindor-tree-item>
    <cindor-tree-item label="Theming"></cindor-tree-item>
  </cindor-tree-item>
</cindor-tree-view>`;
    case "tooltip":
      return `<cindor-tooltip text="Helpful context"></cindor-tooltip>`;
    case "url-input":
      return `<cindor-url-input value="https://cindor.dev"></cindor-url-input>`;
    case "accordion":
      return `<cindor-accordion open>
  <h3>Why Cindor?</h3>
  <p>Reusable primitives keep the library composable.</p>
</cindor-accordion>`;
    default:
      return `<${doc.tag}></${doc.tag}>`;
  }
}

function getReactUsageCode(doc: ComponentDoc): string {
  const componentName = getWrapperComponentName(doc.tag);

  if (doc.slug === "filter-builder") {
    return `import "cindor-ui-core/styles.css";
import { CindorFilterBuilder } from "cindor-ui-react";
import type { FilterBuilderField } from "cindor-ui-core";

const fields: FilterBuilderField[] = ${JSON.stringify(filterBuilderDemoFields, null, 2)};

const initialValue = ${JSON.stringify(filterBuilderPreviewValue)};

export function Example() {
  return <CindorFilterBuilder fields={fields} value={initialValue} />;
}`;
  }

  if (doc.slug === "data-table") {
    return `import { useMemo } from "react";
import "cindor-ui-core/styles.css";
import { CindorDataTable } from "cindor-ui-react";
import type { DataTableColumn, DataTableRow } from "cindor-ui-core";

const rows: DataTableRow[] = [
  { id: "1", component: "cindor-button", layer: "Primitive", use: "Actions" },
  { id: "2", component: "cindor-form-field", layer: "Composite", use: "Forms" }
];

export function Example() {
  const columns = useMemo<DataTableColumn[]>(() => [
    { key: "component", label: "Component", sortable: true },
    { key: "layer", label: "Layer" },
    { key: "use", label: "Use" },
    {
      key: "actions",
      label: "Actions",
      actions: [
        { key: "open", label: "", icon: "arrow-up-right" },
        { key: "edit", label: "Edit", icon: "pencil" }
      ]
    }
  ], []);

  return (
    <CindorDataTable
      caption="Components"
      columns={columns}
      rows={rows}
      onRowAction={(event) => {
        const detail = (event as CustomEvent<{ actionKey: string; row: DataTableRow }>).detail;
        console.log(detail.actionKey, detail.row);
      }}
    />
  );
}`;
  }

  return `import "cindor-ui-core/styles.css";
import { ${componentName} } from "cindor-ui-react";

export function Example() {
  return (
    ${getReactUsageMarkup(doc, componentName)}
  );
}`;
}

function getVueUsageCode(doc: ComponentDoc): string {
  const componentName = getWrapperComponentName(doc.tag);

  if (doc.slug === "filter-builder") {
    return `<script setup lang="ts">
 import "cindor-ui-core/styles.css";
  import { CindorFilterBuilder } from "cindor-ui-vue";
 import type { FilterBuilderField } from "cindor-ui-core";

const fields: FilterBuilderField[] = ${JSON.stringify(filterBuilderDemoFields, null, 2)};
const initialValue = ${JSON.stringify(filterBuilderPreviewValue)};
</script>

<template>
  <CindorFilterBuilder :fields="fields" :model-value="initialValue" />
</template>`;
  }

  if (doc.slug === "data-table") {
    return `<script setup lang="ts">
import "cindor-ui-core/styles.css";
import { CindorDataTable } from "cindor-ui-vue";
import type { DataTableColumn, DataTableRow } from "cindor-ui-core";

const columns: DataTableColumn[] = [
  { key: "component", label: "Component", sortable: true },
  { key: "layer", label: "Layer" },
  { key: "use", label: "Use" },
  {
    key: "actions",
    label: "Actions",
    actions: [
      { key: "open", label: "", icon: "arrow-up-right" },
      { key: "edit", label: "Edit", icon: "pencil" }
    ]
  }
];

const rows: DataTableRow[] = [
  { id: "1", component: "cindor-button", layer: "Primitive", use: "Actions" },
  { id: "2", component: "cindor-form-field", layer: "Composite", use: "Forms" }
];

const handleRowAction = (event: Event) => {
  const detail = (event as CustomEvent<{ actionKey: string; row: DataTableRow }>).detail;
  console.log(detail.actionKey, detail.row);
};
</script>

<template>
  <CindorDataTable
    caption="Components"
    :columns="columns"
    :rows="rows"
    @row-action="handleRowAction"
  />
</template>`;
  }

  return `<script setup lang="ts">
import "cindor-ui-core/styles.css";
import { ${componentName} } from "cindor-ui-vue";
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
    case "activity-feed":
      return `<${componentName}>
      <cindor-activity-item unread>
        <cindor-avatar slot="leading" name="Ops"></cindor-avatar>
        <span slot="title">Database failover completed</span>
        <span slot="timestamp">5 minutes ago</span>
        <span slot="meta">Primary cluster</span>
        Connections were restored automatically after the failover.
      </cindor-activity-item>
    </${componentName}>`;
    case "activity-item":
      return `<cindor-activity-feed>
      <${componentName} unread>
        <cindor-avatar slot="leading" name="Ops"></cindor-avatar>
        <span slot="title">Database failover completed</span>
        <span slot="timestamp">5 minutes ago</span>
        <span slot="meta">Primary cluster</span>
        Connections were restored automatically after the failover.
      </${componentName}>
    </cindor-activity-feed>`;
    case "autocomplete":
      return `<${componentName} placeholder="Search people" />`;
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
    case "tag":
      return `<${componentName} tone="accent" dismissible>Critical</${componentName}>`;
    case "code-block":
      return `<${componentName} code="const ready = true;" language="ts" />`;
    case "command-bar":
      return `<${componentName} label="Bulk actions" description="Apply actions to the current selection." count={3}>
      <span>Selection updates are applied immediately.</span>
      <cindor-button slot="actions" variant="ghost">Clear</cindor-button>
      <cindor-button slot="actions">Archive</cindor-button>
    </${componentName}>`;
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
    case "empty-search-results":
      return `<${componentName} query="access policy">
      <ul>
        <li>Check spelling or abbreviations.</li>
        <li>Remove one or more filters.</li>
      </ul>
      <cindor-button slot="actions" variant="ghost">Reset filters</cindor-button>
      <cindor-button slot="actions">Create saved search</cindor-button>
    </${componentName}>`;
    case "error-text":
      return `<${componentName}>Please enter a valid email address.</${componentName}>`;
    case "form":
      return `<${componentName} description="Create a workspace with shared field and validation wiring.">
      <form>
        <cindor-form-row>
          <cindor-form-field label="Project name" required>
            <cindor-input name="projectName" required />
          </cindor-form-field>
          <cindor-form-field label="Owner email" required>
            <cindor-email-input name="ownerEmail" required />
          </cindor-form-field>
        </cindor-form-row>
        <cindor-button type="submit">Create project</cindor-button>
      </form>
    </${componentName}>`;
    case "form-row":
      return `<${componentName}>
      <cindor-form-field label="First name">
        <cindor-input />
      </cindor-form-field>
      <cindor-form-field label="Last name">
        <cindor-input />
      </cindor-form-field>
    </${componentName}>`;
    case "date-picker":
      return `<${componentName} month="2026-04" value="2026-04-26" />`;
    case "date-range-picker":
      return `<${componentName} month="2026-04" startValue="2026-04-12" endValue="2026-04-18" />`;
    case "date-time-picker":
      return `<${componentName} value="2026-04-28T09:30" />`;
    case "description-item":
      return `<cindor-description-list>
      <${componentName}>
        <span slot="term">Status</span>
        Healthy
      </${componentName}>
    </cindor-description-list>`;
    case "description-list":
      return `<${componentName}>
      <cindor-description-item>
        <span slot="term">Status</span>
        Healthy
      </cindor-description-item>
    </${componentName}>`;
    case "helper-text":
      return `<${componentName}>Used for keyboard shortcuts and system labels.</${componentName}>`;
    case "icon-button":
      return `<${componentName} label="Search" name="search" />`;
    case "input":
      return `<${componentName} placeholder="Project name" />`;
    case "inline-edit":
      return `<${componentName} value="Quarterly roadmap" />`;
    case "layout":
      return `<${componentName}>
      <cindor-layout-header>
        <h2>Release overview</h2>
      </cindor-layout-header>
      <cindor-layout-content>
        <cindor-card>
          <div style={{ padding: "var(--space-4)" }}>Primary content</div>
        </cindor-card>
      </cindor-layout-content>
    </${componentName}>`;
    case "layout-content":
      return `<${componentName}>
      <cindor-card>
        <div style={{ padding: "var(--space-4)" }}>Primary content</div>
      </cindor-card>
    </${componentName}>`;
    case "layout-header":
      return `<${componentName}>
      <cindor-breadcrumbs>
        <a href="/">Home</a>
        <a href="/releases">Releases</a>
      </cindor-breadcrumbs>
      <h2>Release overview</h2>
    </${componentName}>`;
    case "link":
      return `<${componentName} href="#components">Browse components</${componentName}>`;
    case "context-menu":
      return `<${componentName}>
      <div slot="trigger">Right click for actions</div>
      <cindor-menu-item>Rename</cindor-menu-item>
      <cindor-menu-item>Duplicate</cindor-menu-item>
    </${componentName}>`;
    case "menubar":
      return `<${componentName} aria-label="Application menu">
      <cindor-button variant="ghost">File</cindor-button>
      <cindor-button variant="ghost">Edit</cindor-button>
    </${componentName}>`;
    case "navigation-rail":
      return `<${componentName} aria-label="Workspace sections">
      <cindor-navigation-rail-item href="#home" label="Home" current>
        <cindor-icon slot="start" name="house"></cindor-icon>
      </cindor-navigation-rail-item>
    </${componentName}>`;
    case "navigation-rail-item":
      return `<${componentName} href="#home" label="Home" current>
      <cindor-icon slot="start" name="house"></cindor-icon>
    </${componentName}>`;
    case "page-header":
      return `<${componentName}
      eyebrow="Workspace"
      title="Release overview"
      description="Track deployment health, incidents, and pending approvals."
    >
      <cindor-breadcrumbs slot="breadcrumbs">
        <a href="/">Home</a>
        <a href="/workspaces">Workspaces</a>
      </cindor-breadcrumbs>
      <cindor-badge slot="meta" tone="accent">Production</cindor-badge>
      <cindor-button slot="actions">Deploy</cindor-button>
    </${componentName}>`;
    case "panel-inspector":
      return `<${componentName} title="Deployment details" description="Review metadata and release health.">
      <cindor-badge slot="meta" tone="accent">Healthy</cindor-badge>
      <cindor-button slot="actions" variant="ghost">Open logs</cindor-button>
      <cindor-description-list>
        <cindor-description-item>
          <span slot="term">Version</span>
          2026.04.28-1
        </cindor-description-item>
      </cindor-description-list>
      <div slot="footer">Last updated 4 minutes ago by Release Bot.</div>
    </${componentName}>`;
    case "number-input":
      return `<${componentName} value="12" />`;
    case "progress":
      return `<${componentName} max={100} value={68}>68%</${componentName}>`;
    case "provider":
      return `<${componentName} theme="dark">
      <cindor-card>
        <div style={{ padding: "var(--space-4)" }}>Scoped theme boundary</div>
      </cindor-card>
    </${componentName}>`;
    case "multi-select":
      return `<${componentName} placeholder="Choose a role">
      <cindor-option selected value="designer">Designer</cindor-option>
      <cindor-option value="engineer">Engineer</cindor-option>
      <cindor-option value="pm">Product manager</cindor-option>
    </${componentName}>`;
    case "search":
      return `<${componentName} placeholder="Search docs" />`;
    case "side-nav":
      return `<${componentName} aria-label="Documentation">
      <cindor-side-nav-item href="#overview" label="Overview"></cindor-side-nav-item>
      <cindor-side-nav-item expanded label="Guides">
        <cindor-side-nav-item href="#getting-started" label="Getting started" current></cindor-side-nav-item>
      </cindor-side-nav-item>
    </${componentName}>`;
    case "side-nav-item":
      return `<${componentName} expanded label="Guides">
      <cindor-side-nav-item href="#getting-started" label="Getting started"></cindor-side-nav-item>
    </${componentName}>`;
    case "stack":
      return `<${componentName} direction="horizontal" gap="2" wrap align="center">
      <cindor-badge tone="accent">Production</cindor-badge>
      <cindor-badge>12 services</cindor-badge>
      <cindor-button variant="ghost">Share</cindor-button>
    </${componentName}>`;
    case "splitter":
      return `<${componentName} style={{ height: "18rem" }}>
      <cindor-splitter-panel size="28">Navigation</cindor-splitter-panel>
      <cindor-splitter-panel size="72">Workspace</cindor-splitter-panel>
    </${componentName}>`;
    case "splitter-panel":
      return `<${componentName} size={30}>Panel content</${componentName}>`;
    case "switch":
      return `<${componentName}>Available for notifications</${componentName}>`;
    case "tag-input":
      return `<${componentName} values={["Bug", "Urgent"]} placeholder="Add labels" />`;
    case "tabs":
      return `<${componentName} value="overview" aria-label="Release sections">
      <cindor-tab-panel label="Overview" value="overview">Overview details</cindor-tab-panel>
      <cindor-tab-panel label="Activity" value="activity">Recent changes</cindor-tab-panel>
    </${componentName}>`;
    case "stat-card":
      return `<${componentName} label="Monthly recurring revenue" value="$84.2k" change="+12.4%" tone="positive">
      Compared with the previous 30 days.
    </${componentName}>`;
    case "textarea":
      return `<${componentName} rows={4}>Notes</${componentName}>`;
    case "timeline":
      return `<${componentName}>
      <cindor-timeline-item>
        <span slot="title">Project created</span>
        <span slot="timestamp">Apr 20</span>
        Initial workspace scaffolded.
      </cindor-timeline-item>
    </${componentName}>`;
    case "timeline-item":
      return `<cindor-timeline>
      <${componentName}>
        <span slot="title">Deployed</span>
        <span slot="timestamp">2m ago</span>
        Release 1.2.0 shipped to production.
      </${componentName}>
    </cindor-timeline>`;
    case "transfer-list":
      return `<${componentName} selectedValues={["engineering"]}>
      <option value="design">Design</option>
      <option value="engineering">Engineering</option>
      <option value="product">Product</option>
    </${componentName}>`;
    case "tree-item":
      return `<${componentName} label="Guides" expanded>
      <cindor-tree-item label="Getting started"></cindor-tree-item>
    </${componentName}>`;
    case "tree-view":
      return `<${componentName}>
      <cindor-tree-item label="Overview"></cindor-tree-item>
      <cindor-tree-item label="Guides" expanded>
        <cindor-tree-item label="Getting started"></cindor-tree-item>
      </cindor-tree-item>
    </${componentName}>`;
    default:
      return `<${componentName} />`;
  }
}

function getVueUsageMarkup(doc: ComponentDoc, componentName: string): string {
  switch (doc.slug) {
    case "alert":
      return `<${componentName} tone="info">Update complete.</${componentName}>`;
    case "activity-feed":
      return `<${componentName}>
    <cindor-activity-item unread>
      <cindor-avatar slot="leading" name="Ops"></cindor-avatar>
      <span slot="title">Database failover completed</span>
      <span slot="timestamp">5 minutes ago</span>
      <span slot="meta">Primary cluster</span>
      Connections were restored automatically after the failover.
    </cindor-activity-item>
  </${componentName}>`;
    case "activity-item":
      return `<cindor-activity-feed>
    <${componentName} unread>
      <cindor-avatar slot="leading" name="Ops"></cindor-avatar>
      <span slot="title">Database failover completed</span>
      <span slot="timestamp">5 minutes ago</span>
      <span slot="meta">Primary cluster</span>
      Connections were restored automatically after the failover.
    </${componentName}>
  </cindor-activity-feed>`;
    case "autocomplete":
      return `<${componentName} placeholder="Search people" />`;
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
    case "tag":
      return `<${componentName} tone="accent" dismissible>Critical</${componentName}>`;
    case "code-block":
      return `<${componentName} code="const ready = true;" language="ts" />`;
    case "command-bar":
      return `<${componentName} label="Bulk actions" description="Apply actions to the current selection." :count="3">
    <span>Selection updates are applied immediately.</span>
    <cindor-button slot="actions" variant="ghost">Clear</cindor-button>
    <cindor-button slot="actions">Archive</cindor-button>
  </${componentName}>`;
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
    case "empty-search-results":
      return `<${componentName} query="access policy">
    <ul>
      <li>Check spelling or abbreviations.</li>
      <li>Remove one or more filters.</li>
    </ul>
    <cindor-button slot="actions" variant="ghost">Reset filters</cindor-button>
    <cindor-button slot="actions">Create saved search</cindor-button>
  </${componentName}>`;
    case "error-text":
      return `<${componentName}>Please enter a valid email address.</${componentName}>`;
    case "date-picker":
      return `<${componentName} month="2026-04" value="2026-04-26" />`;
    case "date-range-picker":
      return `<${componentName} month="2026-04" start-value="2026-04-12" end-value="2026-04-18" />`;
    case "date-time-picker":
      return `<${componentName} value="2026-04-28T09:30" />`;
    case "description-item":
      return `<cindor-description-list>
    <${componentName}>
      <span slot="term">Status</span>
      Healthy
    </${componentName}>
  </cindor-description-list>`;
    case "description-list":
      return `<${componentName}>
    <cindor-description-item>
      <span slot="term">Status</span>
      Healthy
    </cindor-description-item>
  </${componentName}>`;
    case "helper-text":
      return `<${componentName}>Used for keyboard shortcuts and system labels.</${componentName}>`;
    case "icon-button":
      return `<${componentName} label="Search" name="search" />`;
    case "input":
      return `<${componentName} placeholder="Project name" />`;
    case "inline-edit":
      return `<${componentName} value="Quarterly roadmap" />`;
    case "layout":
      return `<${componentName}>
    <cindor-layout-header>
      <h2>Release overview</h2>
    </cindor-layout-header>
    <cindor-layout-content>
      <cindor-card>
        <div style="padding: var(--space-4);">Primary content</div>
      </cindor-card>
    </cindor-layout-content>
  </${componentName}>`;
    case "layout-content":
      return `<${componentName}>
    <cindor-card>
      <div style="padding: var(--space-4);">Primary content</div>
    </cindor-card>
  </${componentName}>`;
    case "layout-header":
      return `<${componentName}>
    <cindor-breadcrumbs>
      <a href="/">Home</a>
      <a href="/releases">Releases</a>
    </cindor-breadcrumbs>
    <h2>Release overview</h2>
  </${componentName}>`;
    case "link":
      return `<${componentName} href="#components">Browse components</${componentName}>`;
    case "context-menu":
      return `<${componentName}>
    <div slot="trigger">Right click for actions</div>
    <cindor-menu-item>Rename</cindor-menu-item>
    <cindor-menu-item>Duplicate</cindor-menu-item>
  </${componentName}>`;
    case "menubar":
      return `<${componentName} aria-label="Application menu">
    <cindor-button variant="ghost">File</cindor-button>
    <cindor-button variant="ghost">Edit</cindor-button>
  </${componentName}>`;
    case "navigation-rail":
      return `<${componentName} aria-label="Workspace sections">
    <cindor-navigation-rail-item href="#home" label="Home" current>
      <cindor-icon slot="start" name="house"></cindor-icon>
    </cindor-navigation-rail-item>
  </${componentName}>`;
    case "navigation-rail-item":
      return `<${componentName} href="#home" label="Home" current>
    <cindor-icon slot="start" name="house"></cindor-icon>
  </${componentName}>`;
    case "page-header":
      return `<${componentName}
    eyebrow="Workspace"
    title="Release overview"
    description="Track deployment health, incidents, and pending approvals."
  >
    <cindor-breadcrumbs slot="breadcrumbs">
      <a href="/">Home</a>
      <a href="/workspaces">Workspaces</a>
    </cindor-breadcrumbs>
    <cindor-badge slot="meta" tone="accent">Production</cindor-badge>
    <cindor-button slot="actions">Deploy</cindor-button>
  </${componentName}>`;
    case "panel-inspector":
      return `<${componentName} title="Deployment details" description="Review metadata and release health.">
    <cindor-badge slot="meta" tone="accent">Healthy</cindor-badge>
    <cindor-button slot="actions" variant="ghost">Open logs</cindor-button>
    <cindor-description-list>
      <cindor-description-item>
        <span slot="term">Version</span>
        2026.04.28-1
      </cindor-description-item>
    </cindor-description-list>
    <div slot="footer">Last updated 4 minutes ago by Release Bot.</div>
  </${componentName}>`;
    case "number-input":
      return `<${componentName} :value="12" />`;
    case "progress":
      return `<${componentName} :max="100" :value="68">68%</${componentName}>`;
    case "provider":
      return `<${componentName} theme="dark">
    <cindor-card>
      <div style="padding: var(--space-4);">Scoped theme boundary</div>
    </cindor-card>
  </${componentName}>`;
    case "multi-select":
      return `<${componentName} placeholder="Choose a role">
    <cindor-option selected value="designer">Designer</cindor-option>
    <cindor-option value="engineer">Engineer</cindor-option>
    <cindor-option value="pm">Product manager</cindor-option>
  </${componentName}>`;
    case "search":
      return `<${componentName} placeholder="Search docs" />`;
    case "side-nav":
      return `<${componentName} aria-label="Documentation">
    <cindor-side-nav-item href="#overview" label="Overview"></cindor-side-nav-item>
    <cindor-side-nav-item expanded label="Guides">
      <cindor-side-nav-item href="#getting-started" label="Getting started" current></cindor-side-nav-item>
    </cindor-side-nav-item>
  </${componentName}>`;
    case "side-nav-item":
      return `<${componentName} expanded label="Guides">
    <cindor-side-nav-item href="#getting-started" label="Getting started"></cindor-side-nav-item>
  </${componentName}>`;
    case "stack":
      return `<${componentName} direction="horizontal" gap="2" wrap align="center">
    <cindor-badge tone="accent">Production</cindor-badge>
    <cindor-badge>12 services</cindor-badge>
    <cindor-button variant="ghost">Share</cindor-button>
  </${componentName}>`;
    case "splitter":
      return `<${componentName} style="height: 18rem;">
    <cindor-splitter-panel :size="28">Navigation</cindor-splitter-panel>
    <cindor-splitter-panel :size="72">Workspace</cindor-splitter-panel>
  </${componentName}>`;
    case "splitter-panel":
      return `<${componentName} :size="30">Panel content</${componentName}>`;
    case "switch":
      return `<${componentName}>Available for notifications</${componentName}>`;
    case "tag-input":
      return `<${componentName} :model-value="['Bug', 'Urgent']" placeholder="Add labels" />`;
    case "tabs":
      return `<${componentName} value="overview" aria-label="Release sections">
    <cindor-tab-panel label="Overview" value="overview">Overview details</cindor-tab-panel>
    <cindor-tab-panel label="Activity" value="activity">Recent changes</cindor-tab-panel>
  </${componentName}>`;
    case "stat-card":
      return `<${componentName} label="Monthly recurring revenue" value="$84.2k" change="+12.4%" tone="positive">
    Compared with the previous 30 days.
  </${componentName}>`;
    case "textarea":
      return `<${componentName} :rows="4">Notes</${componentName}>`;
    case "timeline":
      return `<${componentName}>
    <cindor-timeline-item>
      <span slot="title">Project created</span>
      <span slot="timestamp">Apr 20</span>
      Initial workspace scaffolded.
    </cindor-timeline-item>
  </${componentName}>`;
    case "timeline-item":
      return `<cindor-timeline>
    <${componentName}>
      <span slot="title">Deployed</span>
      <span slot="timestamp">2m ago</span>
      Release 1.2.0 shipped to production.
    </${componentName}>
  </cindor-timeline>`;
    case "transfer-list":
      return `<${componentName} :model-value="['engineering']">
    <option value="design">Design</option>
    <option value="engineering">Engineering</option>
    <option value="product">Product</option>
  </${componentName}>`;
    case "tree-item":
      return `<${componentName} label="Guides" expanded>
    <cindor-tree-item label="Getting started"></cindor-tree-item>
  </${componentName}>`;
    case "tree-view":
      return `<${componentName}>
    <cindor-tree-item label="Overview"></cindor-tree-item>
    <cindor-tree-item label="Guides" expanded>
      <cindor-tree-item label="Getting started"></cindor-tree-item>
    </cindor-tree-item>
  </${componentName}>`;
    default:
      return `<${componentName} />`;
  }
}

function getPreviewMarkup(doc: ComponentDoc): string | null {
  switch (doc.slug) {
    case "alert":
    case "activity-feed":
    case "activity-item":
    case "avatar":
    case "badge":
    case "breadcrumbs":
    case "button":
    case "button-group":
    case "calendar":
    case "card":
    case "checkbox":
    case "chip":
    case "tag":
    case "code-block":
    case "color-input":
    case "combobox":
    case "command-bar":
    case "autocomplete":
    case "date-picker":
    case "date-range-picker":
    case "date-time-picker":
    case "date-input":
    case "description-item":
    case "description-list":
    case "divider":
    case "dropzone":
    case "email-input":
    case "empty-state":
    case "empty-search-results":
    case "error-text":
    case "fieldset":
    case "file-input":
    case "filter-builder":
    case "form-field":
    case "helper-text":
    case "icon":
    case "icon-button":
    case "input":
    case "inline-edit":
    case "layout":
    case "layout-content":
    case "layout-header":
    case "link":
    case "listbox":
    case "menu":
    case "menu-item":
    case "menubar":
    case "meter":
    case "multi-select":
    case "navigation-rail":
    case "navigation-rail-item":
    case "number-input":
    case "option":
    case "pagination":
    case "password-input":
    case "page-header":
    case "panel-inspector":
    case "progress":
    case "provider":
    case "radio":
    case "range":
    case "rating-input":
    case "search":
    case "select":
    case "skeleton":
    case "side-nav":
    case "side-nav-item":
    case "splitter":
    case "splitter-panel":
    case "spinner":
    case "stack":
    case "stat-card":
    case "switch":
    case "tag-input":
    case "tel-input":
    case "textarea":
    case "time-input":
    case "timeline":
    case "timeline-item":
    case "toast":
    case "toolbar":
    case "transfer-list":
    case "tree-item":
    case "tree-view":
    case "url-input":
      return doc.slug === "filter-builder" ? `<cindor-filter-builder id="filter-builder-preview"></cindor-filter-builder>` : getUsageCode(doc);
    case "data-table":
      return `<div class="preview-block">
        <strong>Small data set preview</strong>
        <p class="muted">Columns can define row actions that render icon buttons or labeled action buttons.</p>
        <table class="plain-preview-table">
          <thead>
            <tr><th>Component</th><th>Layer</th><th>Use</th><th>Row actions</th></tr>
          </thead>
          <tbody>
            ${dataTableSampleRows.map((row) => `<tr><td>${row.component}</td><td>${row.layer}</td><td>${row.use}</td><td>${row.actions}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>`;
    case "segmented-control":
      return `<cindor-segmented-control id="segmented-control-preview" aria-label="Segmented control preview"></cindor-segmented-control>`;
    case "stepper":
      return `<cindor-stepper id="stepper-preview" aria-label="Stepper preview" interactive></cindor-stepper>`;
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

  const eventGroup = (items: ApiItem[], empty = "No Cindor-specific events are documented for this component. Native DOM events still apply where relevant."): ApiGroup => ({
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
          compositionGroup([apiItem("default slot", "Provide one or more cindor-button children.", { type: "slot" })])
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
            apiItem("columns / rows", "Columns and rows are typically assigned as JavaScript properties.", { type: "assigned data objects" }),
            apiItem("columns[].actions", "Per-row action definitions for an actions column. Each action can render as icon-only or as a labeled button.", {
              type: "DataTableRowAction[]"
            })
          ]),
          eventGroup([
            apiItem("row-action", "Fired when a row action button is activated. The detail includes the action key, row data, and column context.", {
              type: "CustomEvent<DataTableRowActionDetail>"
            }),
            apiItem("change", "Sorting, searching, and pagination interactions generally surface through value-like change events in the component.", { type: "Event" })
          ], "Data table behavior is primarily configured through assigned properties and child state."),
          compositionGroup([])
        ],
        intro: `${doc.tag} is one of the more stateful components in the library. In practice it is driven by assigned data and table configuration rather than slot content, including per-row action buttons defined on a column's actions array.`
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
        intro: `${doc.tag} mirrors the native file input model while adding Cindor styling and summaries.`
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
            apiItem("name", "Any Lucide icon name to render.", { type: "string" }),
            apiItem("size", "Optional size override for the icon.", { type: "number | string" })
          ]),
          eventGroup([]),
          compositionGroup([])
        ],
        intro: `${doc.tag} is configured by icon name and optional sizing overrides. Browse the full icon catalog in the <a href="https://lucide.dev/icons/" target="_blank" rel="noreferrer">Lucide docs</a>.`
      };
    case "icon-button":
      return {
        groups: [
          propertyGroup([
            apiItem("label", "Accessible label for the icon-only button.", { defaultValue: `""`, type: "string" }),
            apiItem("name", "Any Lucide icon name to render.", { type: "string" }),
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
        intro: `${doc.tag} keeps the same action model as cindor-button, but its public API is specialized for icon-only affordances.`
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
          compositionGroup([apiItem("default slot", "Provide one or more cindor-option children.", { type: "slot" })])
        ],
        intro: `${doc.tag} coordinates keyboard and selection state across slotted options.`
      };
    case "menu":
      return {
        groups: [
          propertyGroup([]),
          eventGroup([]),
          compositionGroup([apiItem("default slot", "Provide cindor-menu-item children for the actionable rows.", { type: "slot" })])
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
        intro: `${doc.tag} is usually consumed inside cindor-menu or cindor-dropdown-menu, where click handling is delegated to the parent workflow.`
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
          compositionGroup([
            apiItem("cindor-tab-panel children", "Use cindor-tab-panel for explicit label and value props, or pass any light-DOM element with data-label and data-value.", {
              type: "child elements"
            })
          ])
        ],
        intro: `${doc.tag} exposes a single active value and keeps panel composition framework-agnostic, with cindor-tab-panel available as an ergonomic wrapper.`
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
          compositionGroup([apiItem("custom element usage", `Start by using <code>${doc.tag}</code> directly and layering adjacent Cindor primitives around it as needed.`, { type: "custom element" })])
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
