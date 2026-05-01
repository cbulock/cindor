export type ComponentLayer = "Primitive" | "Composite" | "Component";
export type ComponentCategory =
  | "Actions"
  | "Data"
  | "Display"
  | "Feedback"
  | "Forms"
  | "Navigation"
  | "Overlays"
  | "Selection";

export type ComponentDoc = {
  category: ComponentCategory;
  layer: ComponentLayer;
  nativeFoundation: string;
  slug: string;
  summary: string;
  tag: string;
  title: string;
};

const defineComponent = (
  slug: string,
  title: string,
  layer: ComponentLayer,
  category: ComponentCategory,
  nativeFoundation: string,
  summary: string
): ComponentDoc => ({
  category,
  layer,
  nativeFoundation,
  slug,
  summary,
  tag: `emb-${slug}`,
  title
});

export const componentCatalog: ComponentDoc[] = [
  defineComponent("accordion", "Accordion", "Component", "Selection", "details-style disclosure", "Collapsible sections for dense content and settings."),
  defineComponent("alert", "Alert", "Primitive", "Feedback", "status messaging", "Inline feedback for informative, success, warning, or danger states."),
  defineComponent("activity-feed", "Activity Feed", "Component", "Display", "event stream", "Richer event history feed for product, system, and audit activity."),
  defineComponent("activity-item", "Activity Item", "Primitive", "Display", "event row", "Single feed event with leading media, metadata, and optional actions."),
  defineComponent("autocomplete", "Autocomplete", "Component", "Forms", "text input with suggestions", "Suggestion-first text entry for search and remote result flows."),
  defineComponent("avatar", "Avatar", "Primitive", "Display", "img fallback", "Identity thumbnail with image or name-based fallback."),
  defineComponent("badge", "Badge", "Primitive", "Display", "inline label", "Compact label for status, category, and emphasis."),
  defineComponent("breadcrumbs", "Breadcrumbs", "Composite", "Navigation", "anchor trail", "Hierarchical path navigation for pages and app structure."),
  defineComponent("button", "Button", "Primitive", "Actions", "button", "Primary action surface with slot-based icon support."),
  defineComponent("button-group", "Button Group", "Primitive", "Actions", "adjacent button grouping", "Attached or stacked action clusters built from existing buttons."),
  defineComponent("calendar", "Calendar", "Primitive", "Selection", "button grid and table semantics", "Single-date and range selection calendar surface."),
  defineComponent("card", "Card", "Primitive", "Display", "section container", "Framed surface for grouped content and composition."),
  defineComponent("checkbox", "Checkbox", "Primitive", "Forms", "input type=checkbox", "Boolean selection control backed by a native checkbox."),
  defineComponent("chip", "Chip", "Primitive", "Display", "token label", "Compact token for values, filters, and selected items."),
  defineComponent("tag", "Tag", "Primitive", "Display", "tag token", "Explicit tag surface for labels, filters, and removable metadata."),
  defineComponent("code-block", "Code Block", "Component", "Display", "pre and code", "Syntax-highlighted code presentation with optional language hints."),
  defineComponent("color-input", "Color Input", "Primitive", "Forms", "input type=color", "Native color picker wrapped in Emberline styling."),
  defineComponent("combobox", "Combobox", "Component", "Selection", "input plus listbox", "Searchable option picker built from input, listbox, and option primitives."),
  defineComponent("command-bar", "Command Bar", "Composite", "Actions", "summary region plus actions", "Persistent contextual action bar for bulk edits and page-level commands."),
  defineComponent("command-palette", "Command Palette", "Component", "Overlays", "dialog plus search and listbox", "Search-first action launcher for keyboard-driven workflows."),
  defineComponent("context-menu", "Context Menu", "Component", "Overlays", "right-click menu surface", "Pointer- and keyboard-opened contextual actions anchored to a trigger region."),
  defineComponent("data-table", "Data Table", "Component", "Data", "table", "Sortable, searchable, paginated table for application data."),
  defineComponent("date-picker", "Date Picker", "Component", "Forms", "field plus popup calendar", "Popup date field that reuses the shared calendar selection surface."),
  defineComponent("date-range-picker", "Date Range Picker", "Component", "Forms", "field plus popup range calendar", "Popup date range field for filters, reporting, and booking flows."),
  defineComponent("date-time-picker", "Date Time Picker", "Component", "Forms", "date field plus time field", "Combined date and time entry surface built from Emberline date and time inputs."),
  defineComponent("date-input", "Date Input", "Primitive", "Forms", "input type=date", "Native date field wrapped in the shared Emberline input shell."),
  defineComponent("description-item", "Description Item", "Primitive", "Display", "term and detail pair", "Single term-and-value pair used inside a description list."),
  defineComponent("description-list", "Description List", "Composite", "Display", "description list", "Key-value metadata display for settings and detail pages."),
  defineComponent("dialog", "Dialog", "Primitive", "Overlays", "dialog", "Modal and non-modal overlay built on the native dialog element."),
  defineComponent("divider", "Divider", "Primitive", "Display", "hr-style separator", "Visual separator for content regions and grouped controls."),
  defineComponent("drawer", "Drawer", "Component", "Overlays", "dialog-like side panel", "Edge-aligned panel for supplemental flows and secondary tasks."),
  defineComponent("dropdown-menu", "Dropdown Menu", "Component", "Overlays", "button plus menu", "Anchored menu trigger built from menu primitives and floating positioning."),
  defineComponent("dropzone", "Dropzone", "Component", "Forms", "file input and drag and drop", "Drag-and-drop upload surface built over native file selection."),
  defineComponent("email-input", "Email Input", "Primitive", "Forms", "input type=email", "Email field with shared input shell behavior."),
  defineComponent("empty-state", "Empty State", "Component", "Display", "content container", "Structured zero-state messaging for empty data and first-run moments."),
  defineComponent("empty-search-results", "Empty Search Results", "Component", "Display", "search zero state messaging", "Search-specific zero-state surface with suggestions and recovery actions."),
  defineComponent("error-text", "Error Text", "Primitive", "Forms", "support text", "Dedicated validation text primitive for field-level errors."),
  defineComponent("fieldset", "Fieldset", "Primitive", "Forms", "fieldset and legend", "Grouped controls with native fieldset semantics."),
  defineComponent("file-input", "File Input", "Primitive", "Forms", "input type=file", "Styled file picker with selected file summaries."),
  defineComponent("filter-builder", "Filter Builder", "Component", "Forms", "fieldset plus native form controls", "Rule and group filtering interface for advanced query and reporting flows."),
  defineComponent("form", "Form", "Component", "Forms", "form orchestration wrapper", "Higher-level form surface for layout, validation summaries, and submission state."),
  defineComponent("form-field", "Form Field", "Composite", "Forms", "label description wrapper", "Reusable field framing with label, help text, and error slots."),
  defineComponent("form-row", "Form Row", "Composite", "Forms", "responsive field grid", "Responsive row layout for composing multiple Emberline form fields together."),
  defineComponent("helper-text", "Helper Text", "Primitive", "Forms", "support text", "Secondary descriptive text for form controls."),
  defineComponent("icon", "Icon", "Primitive", "Display", "svg icon", "Lucide-backed icon wrapper used across the library."),
  defineComponent("icon-button", "Icon Button", "Primitive", "Actions", "button plus icon", "Icon-only action button built from the core button surface."),
  defineComponent("input", "Input", "Primitive", "Forms", "input type=text", "Shared text input shell and the foundation for typed input variants."),
  defineComponent("inline-edit", "Inline Edit", "Component", "Forms", "editable text display", "Inline text editing surface for names, labels, and lightweight settings."),
  defineComponent("layout", "Layout", "Composite", "Display", "page section scaffold", "Page-level layout container that composes header and content regions with Emberline spacing."),
  defineComponent("layout-content", "Layout Content", "Primitive", "Display", "section region", "Primary content region for cards, forms, tables, and page sections."),
  defineComponent("layout-header", "Layout Header", "Primitive", "Display", "header region", "Header region for titles, breadcrumbs, actions, and supporting metadata."),
  defineComponent("link", "Link", "Primitive", "Navigation", "anchor", "Styled anchor wrapper that preserves native link behavior."),
  defineComponent("listbox", "Listbox", "Primitive", "Selection", "listbox", "Option container for comboboxes, selectors, and custom pickers."),
  defineComponent("menu", "Menu", "Primitive", "Overlays", "menu", "Menu container for action lists and contextual controls."),
  defineComponent("menu-item", "Menu Item", "Primitive", "Overlays", "menu item", "Selectable action row inside a menu."),
  defineComponent("menubar", "Menubar", "Component", "Navigation", "application menubar", "Horizontal application menubar with roving keyboard focus."),
  defineComponent("meter", "Meter", "Primitive", "Data", "meter", "Bounded scalar indicator for quality, score, or health."),
  defineComponent("multi-select", "Multi Select", "Component", "Selection", "input plus multiselectable listbox", "Searchable multi-select picker with chip summaries for selected values."),
  defineComponent("navigation-rail", "Navigation Rail", "Component", "Navigation", "compact nav landmark", "Compact icon-and-label app navigation rail for dashboard shells."),
  defineComponent("navigation-rail-item", "Navigation Rail Item", "Primitive", "Navigation", "compact nav row", "Single destination inside a navigation rail with icon and label support."),
  defineComponent("number-input", "Number Input", "Primitive", "Forms", "input type=number", "Numeric field with the shared input shell."),
  defineComponent("option", "Option", "Primitive", "Selection", "option row", "Option primitive for listbox and combobox composition."),
  defineComponent("pagination", "Pagination", "Component", "Navigation", "button navigation", "Paged result navigation with current page state."),
  defineComponent("password-input", "Password Input", "Primitive", "Forms", "input type=password", "Password field with visibility toggle behavior."),
  defineComponent("page-header", "Page Header", "Composite", "Display", "header with metadata and actions", "Reusable title, metadata, and action layout for application pages."),
  defineComponent("panel-inspector", "Panel Inspector", "Composite", "Display", "details aside", "Reusable inspector or details panel for metadata, controls, and supplemental context."),
  defineComponent("popover", "Popover", "Primitive", "Overlays", "anchored floating surface", "Positioned supplemental content surface for contextual UI."),
  defineComponent("progress", "Progress", "Primitive", "Data", "progress", "Task progress indicator backed by native progress semantics."),
  defineComponent("provider", "Provider", "Primitive", "Display", "theme scope boundary", "Lightweight provider analogue for scoping Emberline theme and color-scheme state."),
  defineComponent("radio", "Radio", "Primitive", "Forms", "input type=radio", "Single-choice radio control with shared labeling support."),
  defineComponent("range", "Range", "Primitive", "Forms", "input type=range", "Native slider wrapped in the Emberline form model."),
  defineComponent("rating-input", "Rating Input", "Composite", "Forms", "radio-backed rating", "Multi-step rating control built from native selection mechanics."),
  defineComponent("search", "Search", "Primitive", "Forms", "input type=search", "Search field with a built-in leading icon affordance."),
  defineComponent("segmented-control", "Segmented Control", "Composite", "Selection", "radio-backed grouped choices", "Single-selection segmented choices using native radio inputs."),
  defineComponent("select", "Select", "Primitive", "Forms", "select", "Styled native select wrapper that preserves platform behavior."),
  defineComponent("skeleton", "Skeleton", "Primitive", "Display", "placeholder block", "Loading placeholder for deferred content."),
  defineComponent("side-nav", "Side Nav", "Component", "Navigation", "nav landmark and nested links", "Persistent application or docs navigation with nested collapsible sections."),
  defineComponent("side-nav-item", "Side Nav Item", "Primitive", "Navigation", "nested nav row", "Single row inside side navigation with optional nested children."),
  defineComponent("splitter", "Splitter", "Component", "Display", "resizable flex layout", "Resizable multi-panel layout for application shells and workbench views."),
  defineComponent("splitter-panel", "Splitter Panel", "Primitive", "Display", "panel surface", "Panel region that participates in splitter sizing and resizing."),
  defineComponent("spinner", "Spinner", "Primitive", "Feedback", "indeterminate loader", "Compact loading indicator for pending work."),
  defineComponent("stack", "Stack", "Primitive", "Display", "flex stack", "Spacing primitive for vertical, horizontal, and wrapped alignment patterns."),
  defineComponent("stepper", "Stepper", "Component", "Navigation", "step list and buttons", "Progress and workflow navigation for multi-step flows."),
  defineComponent("switch", "Switch", "Primitive", "Forms", "checkbox-based toggle", "Boolean toggle styled as a switch."),
  defineComponent("tag-input", "Tag Input", "Component", "Forms", "text input with tokenized values", "Freeform tag entry surface for labels, filters, and lightweight categorization."),
  defineComponent("stat-card", "Stat Card", "Component", "Data", "summary metric card", "Dashboard metric card for KPI, trend, and supporting context."),
  defineComponent("tabs", "Tabs", "Component", "Navigation", "tablist and panels", "Keyboard-accessible tabbed content navigation."),
  defineComponent("tel-input", "Tel Input", "Primitive", "Forms", "input type=tel", "Telephone input variant built from the shared input shell."),
  defineComponent("textarea", "Textarea", "Primitive", "Forms", "textarea", "Multiline text entry with shared accessibility wiring."),
  defineComponent("time-input", "Time Input", "Primitive", "Forms", "input type=time", "Native time field wrapped in the shared input shell."),
  defineComponent("timeline", "Timeline", "Component", "Display", "ordered event history", "Ordered event timeline for status history and milestone summaries."),
  defineComponent("timeline-item", "Timeline Item", "Primitive", "Display", "single event row", "Single event entry inside a timeline with title, time, and body content."),
  defineComponent("toast", "Toast", "Component", "Feedback", "status message overlay", "Transient notification surface for background events."),
  defineComponent("toast-region", "Toast Region", "Component", "Feedback", "notification host region", "Fixed-position host that manages stacked toasts."),
  defineComponent("toolbar", "Toolbar", "Primitive", "Actions", "toolbar semantics", "Roving-focus action bar for grouped controls."),
  defineComponent("transfer-list", "Transfer List", "Component", "Selection", "dual native multiple select", "Move values between available and chosen collections with native multi-select behavior."),
  defineComponent("tree-item", "Tree Item", "Primitive", "Navigation", "tree row", "Single row inside a tree with optional nested child items."),
  defineComponent("tree-view", "Tree View", "Component", "Navigation", "hierarchical tree", "Single-selection tree surface for nested navigation and content hierarchies."),
  defineComponent("tooltip", "Tooltip", "Primitive", "Overlays", "hover and focus hint", "Contextual hint surface for terse supporting text."),
  defineComponent("url-input", "URL Input", "Primitive", "Forms", "input type=url", "URL field variant built from the shared input shell.")
].sort((left, right) => left.title.localeCompare(right.title));

export const componentLayerOptions = ["all", "Primitive", "Composite", "Component"] as const;

export type ComponentLayerFilter = (typeof componentLayerOptions)[number];

export function getComponentDoc(slug: string): ComponentDoc | undefined {
  return componentCatalog.find((component) => component.slug === slug);
}
