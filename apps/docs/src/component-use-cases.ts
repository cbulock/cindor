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
  "activity-feed": [
    {
      title: "Recent system history",
      description: "Use it when a page should show a stream of deployment, incident, review, or collaboration updates in one readable column."
    },
    {
      title: "Entity-specific activity",
      description: "Place it on project, customer, or release pages where recent changes matter as much as the current state."
    },
    {
      title: "Audit-style storytelling",
      description: "Reach for it when events should feel richer and more readable than a flat log table."
    }
  ],
  "activity-item": [
    {
      title: "Readable event rows",
      description: "Use it as the building block for event feeds that need avatars, metadata, timestamps, and supporting context together."
    },
    {
      title: "Mixed-priority updates",
      description: "Place it where some events should stand out with unread or highlighted styling without changing the whole feed pattern."
    },
    {
      title: "Human-friendly operational detail",
      description: "Reach for it when event history should feel like a narrative update instead of raw log output."
    }
  ],
  avatar: [
    {
      title: "People and team identity",
      description: "Use it in comments, assignments, activity feeds, and ownership metadata where a human or team identity should be instantly recognizable."
    },
    {
      title: "Compact record context",
      description: "Place it in lists and cards when a small visual cue helps users distinguish between related entities."
    },
    {
      title: "Fallback-safe presence",
      description: "Reach for it when initials should gracefully replace missing imagery without breaking layout."
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
  banner: [
    {
      title: "App-wide announcements",
      description: "Use it when status, maintenance, or rollout messaging should stay visible across an entire page or workspace."
    },
    {
      title: "Persistent upgrade nudges",
      description: "Place it where a message should remain available until the user acts or dismisses it."
    },
    {
      title: "Global warning surfaces",
      description: "Reach for it when the message matters more than an inline alert but does not justify blocking the page with a dialog."
    }
  ],
  badge: [
    {
      title: "Compact status marking",
      description: "Use it for environment labels, state chips, counts, or small categorical signals that should stay scannable."
    },
    {
      title: "Metadata compression",
      description: "Place it in headers, cards, and tables when auxiliary information should not take over the layout."
    },
    {
      title: "Cross-page consistency",
      description: "Reach for it when teams need one small visual language for state instead of inventing ad hoc text treatments."
    }
  ],
  "button-group": [
    {
      title: "Adjacent workflow controls",
      description: "Use it when a few related actions belong together and should read as one cluster."
    },
    {
      title: "Back-and-forward navigation",
      description: "Place it in steppers, inspectors, and setup flows where movement between states should be visually grouped."
    },
    {
      title: "Density without ambiguity",
      description: "Reach for it when actions need to stay compact without collapsing into an unlabeled toolbar."
    }
  ],
  calendar: [
    {
      title: "Always-visible date selection",
      description: "Use it when the calendar itself should stay on screen instead of hiding behind a field trigger."
    },
    {
      title: "Scheduling and booking UIs",
      description: "Place it in planners, reports, and booking-style workflows where adjacent dates matter to the decision."
    },
    {
      title: "Embedded range exploration",
      description: "Reach for it when users should compare dates visually before committing to a value."
    }
  ],
  chip: [
    {
      title: "Compact filter tokens",
      description: "Use it to represent active scopes, query fragments, or selected lightweight values near search and filtering controls."
    },
    {
      title: "Inline categorization",
      description: "Place it in cards, rows, and metadata strips where short labels should remain visible but unobtrusive."
    },
    {
      title: "Small compositional state markers",
      description: "Reach for it when a value needs a visual container but not the stronger status semantics of a badge."
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
  "code-block": [
    {
      title: "API and integration examples",
      description: "Use it in docs and settings flows where copyable commands, markup, or snippets are part of the task."
    },
    {
      title: "Operational handoff instructions",
      description: "Place it where teams need exact commands or config fragments without formatting drift."
    },
    {
      title: "Readable technical reference",
      description: "Reach for it when raw code should stay scannable, syntax-highlighted, and visually separate from prose."
    }
  ],
  "color-input": [
    {
      title: "Brand and theme customization",
      description: "Use it when users need to pick an accent, label color, or token value directly."
    },
    {
      title: "Visual settings panels",
      description: "Place it in design, theming, or organization-branding flows where color is a first-class input."
    },
    {
      title: "Low-friction styling controls",
      description: "Reach for it when freeform hex entry would slow down a mostly visual choice."
    }
  ],
  combobox: [
    {
      title: "Searchable single selection",
      description: "Use it when a select is too long and users should narrow options by typing before picking one."
    },
    {
      title: "Entity assignment with a known target",
      description: "Place it in forms where one owner, role, or category must be chosen from a large list."
    },
    {
      title: "Hybrid input and option flows",
      description: "Reach for it when the interface should feel faster than a plain select without becoming a full search experience."
    }
  ],
  "command-bar": [
    {
      title: "Bulk action confirmation",
      description: "Use it when row selection or object selection should promote a clear set of next actions."
    },
    {
      title: "Contextual workspace controls",
      description: "Place it near data-heavy views where users need actions tied to the current page state."
    },
    {
      title: "Action hierarchy without hidden menus",
      description: "Reach for it when the most important commands should stay visible instead of disappearing into dropdowns."
    }
  ],
  "context-menu": [
    {
      title: "Pointer-first contextual actions",
      description: "Use it when right-click or long-press actions should stay close to the object they affect."
    },
    {
      title: "Dense workbench interactions",
      description: "Place it in file browsers, tables, and editors where secondary actions would clutter the primary UI."
    },
    {
      title: "Advanced command discovery",
      description: "Reach for it when expert users expect more actions than the visible surface can comfortably show."
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
  "data-view-toolbar": [
    {
      title: "Collection-page orchestration",
      description: "Use it above tables, boards, or galleries when filters, counts, selections, and actions all belong to one control band."
    },
    {
      title: "Bulk-action workflows",
      description: "Place it where the current selection should immediately affect visible actions and supporting copy."
    },
    {
      title: "Shared admin shell patterns",
      description: "Reach for it when multiple collection pages should feel consistent without reassembling the same header logic each time."
    }
  ],
  "date-picker": [
    {
      title: "Single-date scheduling",
      description: "Use it for due dates, publish dates, and appointment selection when a calendar popup is faster than raw typing."
    },
    {
      title: "Human-readable date entry",
      description: "Place it in forms where users benefit from seeing nearby dates instead of recalling exact formatting."
    },
    {
      title: "Deadline-sensitive workflows",
      description: "Reach for it when time-adjacent decisions should start with choosing the right day."
    }
  ],
  "date-range-picker": [
    {
      title: "Reporting windows",
      description: "Use it for analytics, billing, and audit flows where users need a clear start and end range."
    },
    {
      title: "Booking and planning interfaces",
      description: "Place it where a span matters more than a single date."
    },
    {
      title: "Filterable time slices",
      description: "Reach for it when narrowing a dataset by timeframe is central to the workflow."
    }
  ],
  "date-time-picker": [
    {
      title: "Precise scheduling",
      description: "Use it when users need both the day and the exact time in one flow, such as launches, meetings, or automation triggers."
    },
    {
      title: "Operational coordination",
      description: "Place it in admin tools where timing accuracy matters more than a lightweight date-only field."
    },
    {
      title: "One-stop temporal input",
      description: "Reach for it when splitting date and time across separate controls would make the task harder to review."
    }
  ],
  "date-input": [
    {
      title: "Lightweight date fields",
      description: "Use it when native date semantics are enough and a heavier popup picker would add unnecessary ceremony."
    },
    {
      title: "Structured forms",
      description: "Place it in admin and settings screens where the user already knows the exact date they want to enter."
    },
    {
      title: "Fast browser-native entry",
      description: "Reach for it when you want consistency with platform date controls and validation."
    }
  ],
  dialog: [
    {
      title: "Focused confirmations and decisions",
      description: "Use it when a risky, important, or interruptive action deserves the user's full attention before they continue."
    },
    {
      title: "Contained setup and edit flows",
      description: "Place it where a short form or configuration step should stay close to the current page instead of becoming its own route."
    },
    {
      title: "Temporary high-attention context",
      description: "Reach for it when supporting detail, approvals, or next-step choices should block background interaction until resolved."
    }
  ],
  drawer: [
    {
      title: "Secondary workflows beside primary content",
      description: "Use it when details, edits, or supporting actions should slide in without fully taking users away from the current page."
    },
    {
      title: "Large-screen inspectors and forms",
      description: "Place it in admin and workbench layouts where side-mounted context feels lighter than a full dialog."
    },
    {
      title: "Progressive disclosure with more room",
      description: "Reach for it when a popover is too small and a modal would feel heavier than the task requires."
    }
  ],
  "dropdown-menu": [
    {
      title: "Compact secondary actions",
      description: "Use it when rows, cards, or headers need a short list of less-frequent commands without promoting them all into visible buttons."
    },
    {
      title: "Context-aware action bundles",
      description: "Place it where the available commands depend on the current object, selection, or state."
    },
    {
      title: "Density without toolbar sprawl",
      description: "Reach for it when the interface should stay tidy while still exposing meaningful follow-up actions."
    }
  ],
  dropzone: [
    {
      title: "Drag-and-drop ingestion",
      description: "Use it for uploads, imports, and asset collection flows where dragging files in should feel like the fastest path."
    },
    {
      title: "Bulk document or media intake",
      description: "Place it in workflows that benefit from dropping several files at once instead of browsing one by one."
    },
    {
      title: "Upload-first empty states",
      description: "Reach for it when the page itself should invite contribution before any content exists yet."
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
  "empty-search-results": [
    {
      title: "Search dead-end recovery",
      description: "Use it when a query returns nothing and the product should guide the user toward a better next step."
    },
    {
      title: "Filter-reset moments",
      description: "Place it in collection views where the problem may be over-narrowed criteria rather than truly missing data."
    },
    {
      title: "Search education",
      description: "Reach for it when a zero-result state is also a chance to teach broader queries, saved searches, or alternate paths."
    }
  ],
  "error-text": [
    {
      title: "Field-level validation",
      description: "Use it directly under inputs when the user should know exactly what is wrong and how to fix it."
    },
    {
      title: "Accessible form recovery",
      description: "Place it where validation messaging must stay visually and semantically close to the offending field."
    },
    {
      title: "Consistent support language",
      description: "Reach for it when teams need one reliable treatment for errors instead of ad hoc red text."
    }
  ],
  fieldset: [
    {
      title: "Related control grouping",
      description: "Use it when several inputs belong to the same question or settings area and should be announced together."
    },
    {
      title: "Preference clusters",
      description: "Place it around notification, permission, or configuration options that form one conceptual unit."
    },
    {
      title: "Semantics-first forms",
      description: "Reach for it when accessibility and native grouping matter as much as layout."
    }
  ],
  "file-input": [
    {
      title: "Direct attachment flows",
      description: "Use it when users need a familiar upload control for forms, records, or one-off submissions."
    },
    {
      title: "Low-friction document collection",
      description: "Place it where drag-and-drop is unnecessary but explicit file picking should still feel polished."
    },
    {
      title: "Fallback upload paths",
      description: "Reach for it alongside richer upload surfaces so there is always a straightforward selection option."
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
  "inline-edit": [
    {
      title: "Quick metadata edits",
      description: "Use it when titles, labels, or names should be editable in place without opening a full form."
    },
    {
      title: "Workbench refinement",
      description: "Place it in dashboards and admin tools where users often tweak labels while staying in context."
    },
    {
      title: "Low-friction authoring",
      description: "Reach for it when a separate edit mode would feel heavier than the change itself."
    }
  ],
  grid: [
    {
      title: "Dashboard and summary card layouts",
      description: "Use it when cards, metrics, or supporting panels should auto-wrap into a clean multi-column arrangement."
    },
    {
      title: "Responsive detail page composition",
      description: "Place it in docs, admin screens, and workspaces where related sections should align without committing to a full app shell."
    },
    {
      title: "Reusable layout scaffolding",
      description: "Reach for it when teams need a first-class grid primitive instead of repeating one-off CSS grid wrappers across features."
    }
  ],
  "kanban-board": [
    {
      title: "Workflow status boards",
      description: "Use it when teams need to scan work by stage, compare lane pressure, and keep active items visible without drilling into a table."
    },
    {
      title: "Operational planning surfaces",
      description: "Place it in product ops, launch, support, or editorial workflows where ownership and next action matter more than raw record density."
    },
    {
      title: "Shared standup context",
      description: "Reach for it when a team needs one board-style surface for triage, in-progress work, blockers, and recently shipped tasks."
    }
  ],
  layout: [
    {
      title: "Reusable page shells",
      description: "Use it when a product needs a consistent arrangement for header, content, and supporting structure."
    },
    {
      title: "Docs and admin foundations",
      description: "Place it in application areas where visual rhythm matters more than bespoke page composition."
    },
    {
      title: "Composable long-lived screens",
      description: "Reach for it when many pages should share a frame before they diverge in content."
    }
  ],
  "layout-content": [
    {
      title: "Primary content regions",
      description: "Use it to define the main reading or working area inside a reusable shell."
    },
    {
      title: "Consistent spacing boundaries",
      description: "Place it where pages should inherit the same content rhythm without per-screen layout code."
    },
    {
      title: "Shell composition",
      description: "Reach for it when header and content should remain distinct but coordinated."
    }
  ],
  "layout-header": [
    {
      title: "Page-level framing",
      description: "Use it when a screen needs breadcrumbs, a title, and supporting actions in a lighter shell than page-header."
    },
    {
      title: "Reusable app chrome",
      description: "Place it in layouts where the top section should be consistent across many views."
    },
    {
      title: "Content-aware headers",
      description: "Reach for it when the page title belongs to the layout itself rather than a richer content component."
    }
  ],
  "helper-text": [
    {
      title: "Inline guidance under fields",
      description: "Use it when the user needs a small hint, format note, or consequence explanation before entering a value."
    },
    {
      title: "Subtle instructional copy",
      description: "Place it in forms and settings where support text should stay available without competing with the label."
    },
    {
      title: "Consistency for field hints",
      description: "Reach for it when teams need one visual treatment for non-error supporting text."
    }
  ],
  icon: [
    {
      title: "Compact visual cues",
      description: "Use it when labels, statuses, or controls benefit from a recognizable symbol without adding a full illustration."
    },
    {
      title: "Action affordance reinforcement",
      description: "Place it next to buttons, chips, and navigation items where a small visual hint improves scanning."
    },
    {
      title: "System-wide symbolic language",
      description: "Reach for it when many parts of the product should share a consistent icon vocabulary."
    }
  ],
  "icon-button": [
    {
      title: "Compact utility actions",
      description: "Use it for close, search, favorite, copy, and similar actions that are well understood from iconography alone."
    },
    {
      title: "Dense row and card controls",
      description: "Place it where space is tight but the action should remain immediately clickable."
    },
    {
      title: "Secondary chrome actions",
      description: "Reach for it when a full labeled button would visually outweigh the importance of the command."
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
  listbox: [
    {
      title: "Persistent option browsing",
      description: "Use it when users should see several selectable options at once instead of opening a collapsed menu."
    },
    {
      title: "Keyboard-first choice panels",
      description: "Place it in settings, pickers, and dual-panel flows where arrow-key movement and visible focus matter."
    },
    {
      title: "Selection UIs with richer context",
      description: "Reach for it when each option needs more structure than a basic select can comfortably show."
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
  menu: [
    {
      title: "Action lists",
      description: "Use it when a compact set of related commands should appear together with strong keyboard semantics."
    },
    {
      title: "Contextual command surfaces",
      description: "Place it inside dropdowns, palettes, and right-click flows where users expect a stacked action list."
    },
    {
      title: "Action hierarchy reuse",
      description: "Reach for it when several components should share the same menu-row building block."
    }
  ],
  "menu-item": [
    {
      title: "Single command rows",
      description: "Use it as the actionable unit inside menus and dropdown patterns."
    },
    {
      title: "Mixed-priority actions",
      description: "Place it where some commands must be disabled, separated, or grouped without losing menu semantics."
    },
    {
      title: "Reusable action plumbing",
      description: "Reach for it when menu-like surfaces should share one consistent row primitive."
    }
  ],
  menubar: [
    {
      title: "Desktop-style application chrome",
      description: "Use it in tools where top-level command groupings like File, Edit, and View still make sense."
    },
    {
      title: "Power-user environments",
      description: "Place it in workbench-style products where keyboard and command density matter."
    },
    {
      title: "Persistent high-level actions",
      description: "Reach for it when commands should stay globally available rather than local to one panel."
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
  option: [
    {
      title: "Structured selectable rows",
      description: "Use it as the individual choice primitive inside listbox and select-style experiences that need consistent semantics."
    },
    {
      title: "Choice sets with metadata",
      description: "Place it where each selectable item may carry labels, descriptions, or supporting state."
    },
    {
      title: "Reusable selection plumbing",
      description: "Reach for it when multiple higher-level choice components should share one option treatment."
    }
  ],
  "password-input": [
    {
      title: "Credential and secret entry",
      description: "Use it wherever a sensitive text value should support masking and reveal-on-demand behavior."
    },
    {
      title: "Account and setup flows",
      description: "Place it in sign-in, invite, onboarding, and integration screens that ask for secure values."
    },
    {
      title: "Less error-prone secret input",
      description: "Reach for it when users may need to verify what they typed without abandoning secure defaults."
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
  progress: [
    {
      title: "Long-running task feedback",
      description: "Use it when the product can quantify completion for uploads, imports, deploys, or generation work."
    },
    {
      title: "Inline workflow reassurance",
      description: "Place it near the task itself so users can see movement without scanning for global status."
    },
    {
      title: "Deterministic completion states",
      description: "Reach for it when a percentage or bounded total matters more than a generic spinner."
    }
  ],
  radio: [
    {
      title: "Single-choice decisions with visible tradeoffs",
      description: "Use it when users should compare a small number of mutually exclusive options without opening a menu."
    },
    {
      title: "Settings with explanatory copy",
      description: "Place it in billing, notification, and configuration flows where each option benefits from a short description."
    },
    {
      title: "High-clarity preference selection",
      description: "Reach for it when the wrong choice is costly enough that all options should remain visible together."
    }
  ],
  range: [
    {
      title: "Continuous value tuning",
      description: "Use it when users should adjust a bounded value such as volume, density, threshold, or confidence with immediate visual feedback."
    },
    {
      title: "Preference sliders",
      description: "Place it in personalization and configuration flows where the exact number matters less than the relative position."
    },
    {
      title: "Fast exploratory adjustment",
      description: "Reach for it when scrubbing through nearby values is more natural than typing a number."
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
  select: [
    {
      title: "Compact one-of-many selection",
      description: "Use it when users need to choose one known value from a moderate list without dedicating much screen space."
    },
    {
      title: "Form-friendly scope setting",
      description: "Place it in create, edit, and settings flows where category, owner, or status choices should stay compact."
    },
    {
      title: "Standardized input patterns",
      description: "Reach for it when consistency and familiarity matter more than the richer discoverability of a visible listbox."
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
  "split-button": [
    {
      title: "Primary action with adjacent alternatives",
      description: "Use it when one action should stay prominent but nearby variants or follow-up choices should remain one click away."
    },
    {
      title: "Operational tools with a safe default",
      description: "Place it in publish, export, create, or run flows where most users take the standard path but power users need options."
    },
    {
      title: "Action density without ambiguity",
      description: "Reach for it when a plain dropdown hides the primary action too much and separate buttons would feel noisy."
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
  switch: [
    {
      title: "Immediate binary preferences",
      description: "Use it when a setting is naturally on or off and users expect a lightweight toggle instead of form submission ceremony."
    },
    {
      title: "Live feature controls",
      description: "Place it in settings and admin screens where changing the value should feel fast and direct."
    },
    {
      title: "Scannable toggle lists",
      description: "Reach for it when several boolean controls should be easy to compare vertically at a glance."
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
  stepper: [
    {
      title: "Multi-step progress guidance",
      description: "Use it when onboarding, setup, or checkout-style flows should show users where they are and what comes next."
    },
    {
      title: "Process-heavy operational tasks",
      description: "Place it in workflows that span several required phases so people can recover their place after interruptions."
    },
    {
      title: "Confidence in longer forms",
      description: "Reach for it when breaking a complex task into visible steps makes the work feel more manageable."
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
  tag: [
    {
      title: "Lightweight metadata labeling",
      description: "Use it for categories, taxonomy, or short descriptors that should remain visually attached to records or content."
    },
    {
      title: "Filter-friendly classification",
      description: "Place it where labels may double as search or filtering cues across lists and detail views."
    },
    {
      title: "Small compositional markers",
      description: "Reach for it when information needs a visible wrapper but not the stronger status connotations of a badge."
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
  toast: [
    {
      title: "Transient success and warning feedback",
      description: "Use it when saves, background actions, or quick status changes should be acknowledged without blocking the current task."
    },
    {
      title: "Async workflow confirmation",
      description: "Place it in products where uploads, automation, or background jobs often finish while the user stays on the same screen."
    },
    {
      title: "Short-lived app messaging",
      description: "Reach for it when the message matters now but should disappear once the user has seen it."
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
  tooltip: [
    {
      title: "Micro-explanations on demand",
      description: "Use it when labels, icons, or dense controls need a small hint without permanently adding copy to the layout."
    },
    {
      title: "Space-constrained helper text",
      description: "Place it in toolbars, tables, and inspector chrome where support text should appear only on hover or focus."
    },
    {
      title: "Low-ceremony clarification",
      description: "Reach for it when a popover would feel too heavy for the amount of context being added."
    }
  ],
  "transfer-list": [
    {
      title: "Move-between-groups workflows",
      description: "Use it when users need to shift many known items between available and selected collections with clear visual accounting."
    },
    {
      title: "Permission and membership management",
      description: "Place it in role, audience, and assignment flows where both sides of the selection matter at the same time."
    },
    {
      title: "Bulk curation interfaces",
      description: "Reach for it when dual-list movement is more understandable than repeated checkbox selection in a long table."
    }
  ],
  "tree-item": [
    {
      title: "Single hierarchical nodes",
      description: "Use it as the row primitive inside a tree when labels, expand state, and selection behavior should stay consistent."
    },
    {
      title: "Nested navigation and explorers",
      description: "Place it where each branch or leaf may carry its own affordances while still reading as part of one hierarchy."
    },
    {
      title: "Reusable hierarchy building blocks",
      description: "Reach for it when several tree-based experiences should share one accessible item treatment."
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
