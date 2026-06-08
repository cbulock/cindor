import type { ComponentDoc } from "./catalog.js";

export type ComponentUseCase = {
  description: string;
  title: string;
};

const categoryDefaults: Record<ComponentDoc["category"], ComponentUseCase[]> = {
  Actions: [
    {
      title: "Primary task completion",
      description: "Use this surface when the user needs to confirm, save, publish, or move the current flow forward."
    },
    {
      title: "Contextual workspace actions",
      description: "Place it near collection views, detail panels, or toolbars where actions should stay close to the content they affect."
    },
    {
      title: "Bulk and secondary controls",
      description: "Pair it with selection states, menus, or grouped controls when a page needs more than one obvious next step."
    }
  ],
  Data: [
    {
      title: "Operational dashboards",
      description: "Use this component to summarize status, throughput, progress, or health in data-dense admin and internal tooling."
    },
    {
      title: "Collection review",
      description: "Reach for it when users need to scan, compare, or sort records without drilling into each one."
    },
    {
      title: "Decision support",
      description: "Add it where a workflow benefits from quick metrics, trend signals, or bounded measurements before the user acts."
    }
  ],
  Display: [
    {
      title: "Dense product surfaces",
      description: "Use this component to present structured information without forcing users into a modal or separate page."
    },
    {
      title: "Context around primary tasks",
      description: "Place it next to forms, tables, or workflows when supporting detail should stay visible while users work."
    },
    {
      title: "Readable system feedback",
      description: "Reach for it when product state, history, or metadata should be legible at a glance instead of buried in prose."
    }
  ],
  Feedback: [
    {
      title: "Status communication",
      description: "Use this surface to tell the user what just happened, what is loading, or what needs attention next."
    },
    {
      title: "Recovery and reassurance",
      description: "Add it where users need confirmation, warning, or progress feedback before committing a risky action."
    },
    {
      title: "Ambient product signals",
      description: "Reach for it when system messaging should stay visible without hijacking the entire interface."
    }
  ],
  Forms: [
    {
      title: "Structured data entry",
      description: "Use this component in create, edit, onboarding, and settings flows where users need clear, accessible input affordances."
    },
    {
      title: "Validation-friendly workflows",
      description: "Place it where form state, errors, and required values should be explicit instead of hidden behind custom interaction."
    },
    {
      title: "Admin and configuration tooling",
      description: "Reach for it when product teams need reliable field patterns for internal tools, setup screens, or operational forms."
    }
  ],
  Navigation: [
    {
      title: "App structure and wayfinding",
      description: "Use this component when users need to move between pages, sections, or modes without losing their sense of place."
    },
    {
      title: "Multi-surface workflows",
      description: "Place it in tools with dashboards, detail views, or nested docs where orientation matters as much as content."
    },
    {
      title: "Keyboard-friendly movement",
      description: "Reach for it when power users need predictable movement across views, panels, and information hierarchies."
    }
  ],
  Overlays: [
    {
      title: "Secondary tasks without page navigation",
      description: "Use this surface when users need extra context, actions, or focused decisions without leaving the current page."
    },
    {
      title: "Progressive disclosure",
      description: "Place it where advanced controls or supporting information should stay available but not always visible."
    },
    {
      title: "High-attention interaction moments",
      description: "Reach for it when the product needs a contained interaction layer for confirmation, menus, or contextual help."
    }
  ],
  Selection: [
    {
      title: "Choosing one or many values",
      description: "Use this component when users need to select options, narrow scope, or move through a multi-step decision."
    },
    {
      title: "Filter and scope controls",
      description: "Place it near tables, dashboards, and search results when narrowing the current data set is part of the workflow."
    },
    {
      title: "Stateful comparisons",
      description: "Reach for it when the interface should make changes in selection obvious before the user commits to the next step."
    }
  ]
};

const componentOverrides: Partial<Record<ComponentDoc["slug"], ComponentUseCase[]>> = {
  accordion: [
    {
      title: "Dense settings and preferences",
      description: "Use it when a page has many optional controls and users should expand only the sections they care about."
    },
    {
      title: "FAQ and supporting explanations",
      description: "Place it in docs, help centers, and onboarding screens where extra detail should stay available without dominating the page."
    },
    {
      title: "Progressive disclosure inside forms",
      description: "Reach for it when advanced configuration should remain nearby but hidden until the user asks for it."
    }
  ],
  alert: [
    {
      title: "Inline validation and warnings",
      description: "Use it inside forms or setup flows when a specific section needs attention before the user continues."
    },
    {
      title: "Operational state callouts",
      description: "Place it near content when a page should explain degraded state, pending work, or risk without forcing a modal."
    },
    {
      title: "Recovery guidance",
      description: "Reach for it when users need short, actionable guidance after something fails or changes unexpectedly."
    }
  ],
  autocomplete: [
    {
      title: "Remote entity search",
      description: "Use it for people, projects, repositories, or customers when suggestions should appear as the user types."
    },
    {
      title: "Fast assignment workflows",
      description: "Place it in forms where users need to find and select a known item quickly without opening a full picker."
    },
    {
      title: "Command-like text entry",
      description: "Reach for it when free text and structured suggestions should coexist in the same field."
    }
  ],
  breadcrumbs: [
    {
      title: "Deep information architecture",
      description: "Use it when the user can land several levels deep in docs, admin tooling, or nested resources and needs a quick way back up."
    },
    {
      title: "Entity hierarchy views",
      description: "Place it in products with org, workspace, project, and record nesting so the current location stays obvious."
    },
    {
      title: "Cross-linked detail pages",
      description: "Reach for it when detail views should expose their parent path without relying on browser back behavior."
    }
  ],
  button: [
    {
      title: "High-confidence primary actions",
      description: "Use it for save, create, publish, and confirm actions that should be obvious at a glance."
    },
    {
      title: "Inline workflow control",
      description: "Place it where users need to act directly from cards, rows, forms, and dialogs without extra navigation."
    },
    {
      title: "Composable action surfaces",
      description: "Reach for it as the base action primitive before inventing specialized controls."
    }
  ],
  card: [
    {
      title: "Dashboard grouping",
      description: "Use it to frame related metrics, actions, or summaries so dense pages stay readable."
    },
    {
      title: "Collection item presentation",
      description: "Place it in grids and overview pages when each record needs a lightweight visual container."
    },
    {
      title: "Composable content blocks",
      description: "Reach for it when several pieces of content belong together but do not need a custom layout shell yet."
    }
  ],
  checkbox: [
    {
      title: "Optional settings",
      description: "Use it where multiple independent toggles belong to the same preference or configuration group."
    },
    {
      title: "Bulk record selection",
      description: "Place it in tables and lists when users need to select many items before acting."
    },
    {
      title: "Consent and acknowledgement flows",
      description: "Reach for it when a user must explicitly opt into a condition or confirm a requirement."
    }
  ],
  "command-palette": [
    {
      title: "Keyboard-first navigation",
      description: "Use it in product shells where power users should be able to jump between pages, records, and commands without touching the pointer."
    },
    {
      title: "Cross-workspace actions",
      description: "Place it in apps that mix navigation and actions so people can switch projects, run tasks, and open tools from one place."
    },
    {
      title: "Low-chrome admin tools",
      description: "Reach for it when you want fast discoverability without promoting every action into the visible header."
    }
  ],
  "data-table": [
    {
      title: "Back-office record management",
      description: "Use it for users, projects, deployments, tickets, or any dataset that needs scanning, sorting, and row-level actions."
    },
    {
      title: "Audit and operations review",
      description: "Place it where teams compare fields across many records before drilling into a single item."
    },
    {
      title: "Selection-driven workflows",
      description: "Reach for it when bulk actions, filters, and toolbar controls should all respond to the current row selection."
    }
  ],
  "empty-state": [
    {
      title: "First-run product moments",
      description: "Use it when a brand-new workspace, list, or report needs orientation plus a strong next action."
    },
    {
      title: "Zero-data recovery",
      description: "Place it where users might hit an empty collection after filters, permissions, or setup gaps."
    },
    {
      title: "Feature discovery",
      description: "Reach for it when the absence of content is a chance to explain what the surface is for and how to activate it."
    }
  ],
  "filter-builder": [
    {
      title: "Advanced reporting interfaces",
      description: "Use it when simple search is not enough and users need nested rules for analytics, CRM, or ops queries."
    },
    {
      title: "Saved filter workflows",
      description: "Place it in tooling where teams repeatedly refine the same query shapes and need them to stay understandable."
    },
    {
      title: "Rule authoring without custom query syntax",
      description: "Reach for it when the product should expose powerful filtering without forcing users to learn SQL-like text."
    }
  ],
  form: [
    {
      title: "Create and edit flows",
      description: "Use it for multi-field workflows where layout, validation, and submission state should feel consistent across the product."
    },
    {
      title: "Settings surfaces",
      description: "Place it in account, workspace, or system settings where related inputs should feel like one coherent unit."
    },
    {
      title: "Operational handoff screens",
      description: "Reach for it when users are configuring something important and need clear structure before they submit."
    }
  ],
  "form-field": [
    {
      title: "Consistent field framing",
      description: "Use it when labels, descriptions, help text, and errors should stay aligned across many input types."
    },
    {
      title: "Reusable form scaffolding",
      description: "Place it in design-system-backed forms so teams stop rebuilding label and error layouts by hand."
    },
    {
      title: "Accessible input composition",
      description: "Reach for it when a field needs more context than the raw input component should own."
    }
  ],
  "form-row": [
    {
      title: "Responsive form layout",
      description: "Use it when related inputs should share a row on larger screens and collapse cleanly on smaller ones."
    },
    {
      title: "Short multi-field groups",
      description: "Place it around name, date, range, or contact fields that read better together than stacked independently."
    },
    {
      title: "Scannable admin forms",
      description: "Reach for it when high-density settings pages need structure without becoming table-like."
    }
  ],
  input: [
    {
      title: "General text entry",
      description: "Use it for names, labels, titles, and short values that do not require a specialized field variant."
    },
    {
      title: "Structured internal tooling",
      description: "Place it in settings and admin interfaces where consistency matters more than bespoke styling."
    },
    {
      title: "Composed field systems",
      description: "Reach for it inside form-field and form-row patterns as the default starting point for text input."
    }
  ],
  link: [
    {
      title: "Inline navigation cues",
      description: "Use it in supporting copy and metadata when navigation should feel lighter than a button."
    },
    {
      title: "Cross-reference surfaces",
      description: "Place it in docs, entity details, and admin screens where users often jump to related records."
    },
    {
      title: "Secondary actions in prose",
      description: "Reach for it when the next step belongs inside explanatory text rather than a dedicated action bar."
    }
  ],
  "multi-select": [
    {
      title: "Team and permission assignment",
      description: "Use it when users need to pick several known entities such as roles, labels, tags, or members."
    },
    {
      title: "Filter construction",
      description: "Place it near dashboards and result sets when narrowing by several values should stay compact."
    },
    {
      title: "Selected-value review",
      description: "Reach for it when chosen items should remain visible as chips instead of disappearing into a collapsed control."
    }
  ],
  "navigation-rail": [
    {
      title: "Compact app shells",
      description: "Use it in dashboards and internal tools where top-level destinations should stay visible without consuming a full sidebar."
    },
    {
      title: "Workspace-style products",
      description: "Place it in multi-view applications that mix overview, projects, activity, and settings."
    },
    {
      title: "Tablet and narrow desktop layouts",
      description: "Reach for it when the product needs persistent navigation in a smaller footprint than full side nav."
    }
  ],
  "number-input": [
    {
      title: "Bounded operational values",
      description: "Use it for quotas, counts, thresholds, and numeric settings where raw text entry is too loose."
    },
    {
      title: "Configuration forms",
      description: "Place it in pricing, automation, or scheduling screens where numeric precision matters."
    },
    {
      title: "Data-entry workflows",
      description: "Reach for it when validation should reinforce that a field is numeric before submission."
    }
  ],
  "page-header": [
    {
      title: "Detail and overview pages",
      description: "Use it when a screen needs a strong title, metadata, and actions above the main content."
    },
    {
      title: "Cross-functional operational views",
      description: "Place it in release, incident, project, or customer pages where context and next actions must be visible together."
    },
    {
      title: "Reusable shell framing",
      description: "Reach for it when the app should feel consistent across many page types without reinventing the top section each time."
    }
  ],
  "panel-inspector": [
    {
      title: "Detail sidebars",
      description: "Use it next to tables, boards, or editors when metadata and lightweight controls should stay visible while the user works."
    },
    {
      title: "Review and approval flows",
      description: "Place it where teams need a compact summary of status, owners, timestamps, and related actions."
    },
    {
      title: "Workbench layouts",
      description: "Reach for it in split-pane products where the primary content needs a consistent secondary details panel."
    }
  ],
  "pagination": [
    {
      title: "Large result sets",
      description: "Use it when tables, lists, or search pages need explicit movement across many pages of records."
    },
    {
      title: "Stable admin navigation",
      description: "Place it in operational tooling where jumping to the next page should be more predictable than infinite scroll."
    },
    {
      title: "Review workflows with memory",
      description: "Reach for it when users need to understand where they are in a collection and return to that position later."
    }
  ],
  popover: [
    {
      title: "Supplemental, anchored context",
      description: "Use it when extra explanation or controls should appear next to a trigger rather than in a full modal."
    },
    {
      title: "Compact settings and inspectors",
      description: "Place it where a small edit or preview belongs close to the initiating element."
    },
    {
      title: "Low-friction disclosure",
      description: "Reach for it when the product needs more than a tooltip but less than a dialog."
    }
  ],
  provider: [
    {
      title: "Scoped theming experiments",
      description: "Use it when one area of the product or docs should preview a theme without changing the whole application."
    },
    {
      title: "Embedded product surfaces",
      description: "Place it around widgets, previews, or shared packages that need consistent tokens inside another host app."
    },
    {
      title: "Design-system adoption layers",
      description: "Reach for it when teams need a clean boundary for theme state, accent colors, or family variants."
    }
  ],
  search: [
    {
      title: "Global and local query entry",
      description: "Use it for top-level search, collection filtering, and command-adjacent lookup where the input should feel familiar immediately."
    },
    {
      title: "Toolbar filtering",
      description: "Place it in data-heavy surfaces where users repeatedly narrow visible results."
    },
    {
      title: "Recovery from dense screens",
      description: "Reach for it when search is the fastest way out of navigation overload or content sprawl."
    }
  ],
  "segmented-control": [
    {
      title: "Mode switching",
      description: "Use it when users need to move between a few mutually exclusive views such as list, board, and calendar."
    },
    {
      title: "Tight scope filters",
      description: "Place it where one short set of options should stay visible instead of hiding inside a select."
    },
    {
      title: "Immediate state comparisons",
      description: "Reach for it when changes between states should feel instant and easy to compare."
    }
  ],
  "side-nav": [
    {
      title: "Persistent docs and app navigation",
      description: "Use it in products where the left rail is part of the overall mental model, not just a temporary menu."
    },
    {
      title: "Nested section browsing",
      description: "Place it in documentation, settings, or admin areas with a meaningful parent-child hierarchy."
    },
    {
      title: "Long-lived workspaces",
      description: "Reach for it when users spend enough time in the product that stable navigation outweighs minimal chrome."
    }
  ],
  splitter: [
    {
      title: "Workbench interfaces",
      description: "Use it for IDE-like, admin, or support tooling where users need to resize navigation, content, and inspector regions."
    },
    {
      title: "Compare-and-edit layouts",
      description: "Place it where two or more panels should remain visible while people move between reading and editing."
    },
    {
      title: "High-density desktop views",
      description: "Reach for it when fixed layouts waste space and the user should control emphasis between panes."
    }
  ],
  "stat-card": [
    {
      title: "Executive dashboards",
      description: "Use it when one metric, its change, and a short explanation should be digestible in a single glance."
    },
    {
      title: "Operational overview pages",
      description: "Place it at the top of products where KPI summaries should frame the rest of the page."
    },
    {
      title: "Scannable health indicators",
      description: "Reach for it when many metrics need a consistent visual structure before users drill into details."
    }
  ],
  tabs: [
    {
      title: "Related content partitions",
      description: "Use it when multiple views belong to the same page object and users should switch between them without navigation."
    },
    {
      title: "Settings and detail segmentation",
      description: "Place it where overview, activity, permissions, and configuration all belong to one entity."
    },
    {
      title: "Reducing scroll-heavy pages",
      description: "Reach for it when a long page can become clearer by separating concerns into a few stable panels."
    }
  ],
  textarea: [
    {
      title: "Notes and narrative input",
      description: "Use it when the user needs more than a short field for context, rationale, comments, or descriptions."
    },
    {
      title: "Support and ops workflows",
      description: "Place it in forms where people regularly leave handoff notes, incident detail, or customer-facing copy."
    },
    {
      title: "Low-ceremony authoring",
      description: "Reach for it when rich text would be overkill but single-line input is too restrictive."
    }
  ],
  timeline: [
    {
      title: "Release and incident history",
      description: "Use it when users need to understand the order of events, milestones, or interventions over time."
    },
    {
      title: "Project progress storytelling",
      description: "Place it in onboarding, delivery, or support flows where a chronological narrative is more useful than a table."
    },
    {
      title: "Audit-friendly summaries",
      description: "Reach for it when changes should read as a sequence instead of isolated status labels."
    }
  ],
  "toast-region": [
    {
      title: "App-level notifications",
      description: "Use it as the shared host for success, warning, and background status messages across the application shell."
    },
    {
      title: "Async workflow feedback",
      description: "Place it in products with saves, uploads, or background tasks where confirmation should not block the current screen."
    },
    {
      title: "Centralized messaging infrastructure",
      description: "Reach for it when teams need one consistent place to route transient notifications from many features."
    }
  ],
  toolbar: [
    {
      title: "Grouped editing actions",
      description: "Use it where related controls should read as one keyboard-friendly action strip."
    },
    {
      title: "Formatting and manipulation clusters",
      description: "Place it in editors, inspectors, and media tools where users repeatedly apply small commands."
    },
    {
      title: "Dense but structured action surfaces",
      description: "Reach for it when several controls belong together semantically without becoming a generic button pile."
    }
  ],
  "tree-view": [
    {
      title: "Nested docs and settings navigation",
      description: "Use it where content is hierarchical and users need to drill into branches without losing context."
    },
    {
      title: "File- and object-browser patterns",
      description: "Place it in explorer-style surfaces that benefit from expand and collapse behavior."
    },
    {
      title: "Information architecture previews",
      description: "Reach for it when the product should expose parent-child structure directly instead of flattening everything into lists."
    }
  ]
};

export function getComponentUseCases(doc: ComponentDoc): ComponentUseCase[] {
  return componentOverrides[doc.slug] ?? categoryDefaults[doc.category];
}
