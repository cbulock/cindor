const slots = {
  all: "all",
  default: "default",
  none: "none"
};

const bool = (name, defaultValue = false, options = {}) => ({
  attr: options.attr ?? name,
  defaultValue,
  kind: "boolean",
  name
});

const str = (name, defaultValue = "", options = {}) => ({
  alwaysPass: options.alwaysPass ?? false,
  attr: options.attr ?? name,
  defaultValue,
  kind: "string",
  name
});

const num = (name, defaultValue, options = {}) => ({
  attr: options.attr ?? name,
  defaultValue,
  kind: "number",
  name
});

const typed = (name, typeExpression, defaultValue, options = {}) => ({
  alwaysPass: options.alwaysPass ?? true,
  attr: options.attr ?? name,
  defaultValue,
  kind: "typed-string",
  name,
  typeExpression
});

const arr = (name, typeExpression, options = {}) => ({
  attr: options.attr ?? name,
  defaultFactory: options.defaultFactory ?? "() => []",
  kind: "array",
  name,
  typeExpression
});

const handler = (domEvent, options = {}) => ({
  domEvent,
  emitName: options.emitName ?? domEvent,
  modelEmit: options.modelEmit,
  modelHostProperty: options.modelHostProperty,
  modelHostType: options.modelHostType,
  modelValueExpression: options.modelValueExpression
});

const component = (exportName, tagName, options = {}) => ({
  exportName,
  reactEvents: options.reactEvents,
  slots: options.slots ?? slots.none,
  tagName,
  vueHandlers: options.vueHandlers ?? [],
  vueProps: options.vueProps ?? []
});

const inputStringProps = (options = {}) => [
  str("autocomplete", options.autocompleteDefault ?? "", { alwaysPass: Boolean(options.autocompleteDefault) }),
  bool("disabled"),
  str("modelValue", options.modelDefault ?? "", { attr: "value", alwaysPass: true }),
  str("name"),
  ...(options.includeIcons
    ? [
        str("startIcon", options.startIconDefault ?? "", { attr: "start-icon", alwaysPass: Boolean(options.startIconDefault) }),
        str("endIcon", options.endIconDefault ?? "", { attr: "end-icon", alwaysPass: Boolean(options.endIconDefault) })
      ]
    : []),
  str("placeholder"),
  bool("readonly"),
  bool("required")
];

const currentOpen = handler("toggle", {
  emitName: "toggle",
  modelEmit: "update:open",
  modelHostProperty: "open",
  modelHostType: "OpenHost"
});

const textModelHandlers = [
  handler("input", {
    emitName: "input",
    modelEmit: "update:modelValue",
    modelHostProperty: "value",
    modelHostType: "InputHost"
  }),
  handler("change", {
    emitName: "change",
    modelEmit: "update:modelValue",
    modelHostProperty: "value",
    modelHostType: "InputHost"
  })
];

const numberModelHandlers = [
  handler("input", {
    emitName: "input",
    modelEmit: "update:modelValue",
    modelHostProperty: "value",
    modelHostType: "InputHost",
    modelValueExpression: "Number(target.value)"
  }),
  handler("change", {
    emitName: "change",
    modelEmit: "update:modelValue",
    modelHostProperty: "value",
    modelHostType: "InputHost",
    modelValueExpression: "Number(target.value)"
  })
];

const checkedModelHandlers = [
  handler("input", {
    emitName: "input",
    modelEmit: "update:modelValue",
    modelHostProperty: "checked",
    modelHostType: "CheckboxHost"
  }),
  handler("change", {
    emitName: "change",
    modelEmit: "update:modelValue",
    modelHostProperty: "checked",
    modelHostType: "CheckboxHost"
  })
];

export const componentDefinitions = [
  component("EmbButton", "emb-button", {
    slots: slots.all,
    vueProps: [bool("disabled"), bool("iconOnly"), typed("type", "ButtonType", "button"), typed("variant", "ButtonVariant", "solid")]
  }),
  component("EmbButtonGroup", "emb-button-group", {
    slots: slots.default,
    vueProps: [bool("attached"), typed("orientation", "ButtonGroupOrientation", "horizontal")]
  }),
  component("EmbChip", "emb-chip", {
    slots: slots.default,
    vueProps: [typed("tone", "ChipTone", "neutral")]
  }),
  component("EmbTag", "emb-tag", {
    slots: slots.default,
    vueHandlers: [handler("remove")],
    vueProps: [bool("dismissible"), str("removeLabel", "Remove tag", { attr: "remove-label", alwaysPass: true }), typed("tone", "TagTone", "accent")]
  }),
  component("EmbIconButton", "emb-icon-button", {
    vueProps: [
      bool("disabled"),
      str("label"),
      typed("name", "LucideIconName | string", ""),
      num("size", 16),
      num("strokeWidth", 2, { attr: "stroke-width" }),
      typed("type", "ButtonType", "button")
    ]
  }),
  component("EmbCard", "emb-card", { slots: slots.default }),
  component("EmbCalendar", "emb-calendar", {
    reactEvents: ["input", "change"],
    vueHandlers: textModelHandlers,
    vueProps: [
      bool("disabled"),
      str("endValue", "", { attr: "end-value" }),
      str("max"),
      str("min"),
      str("month"),
      str("modelValue", "", { attr: "value", alwaysPass: true }),
      str("name"),
      bool("range"),
      bool("required"),
      str("startValue", "", { attr: "start-value" })
    ]
  }),
  component("EmbBadge", "emb-badge", {
    slots: slots.default,
    vueProps: [typed("tone", '"neutral" | "accent" | "success"', "neutral")]
  }),
  component("EmbDivider", "emb-divider"),
  component("EmbProvider", "emb-provider", {
    slots: slots.default,
    vueProps: [
      typed("colorScheme", "ProviderColorScheme", "inherit", { attr: "color-scheme" }),
      typed("theme", "ProviderTheme", "inherit")
    ]
  }),
  component("EmbSpinner", "emb-spinner"),
  component("EmbAlert", "emb-alert", {
    slots: slots.default,
    vueProps: [typed("tone", '"info" | "success" | "warning" | "danger"', "info")]
  }),
  component("EmbActivityFeed", "emb-activity-feed", {
    slots: slots.default
  }),
  component("EmbActivityItem", "emb-activity-item", {
    slots: slots.all,
    vueProps: [bool("unread")]
  }),
  component("EmbAutocomplete", "emb-autocomplete", {
    reactEvents: ["change", "input", "suggestion-select"],
    vueHandlers: [...textModelHandlers, handler("suggestion-select")],
    vueProps: [
      bool("disabled"),
      str("emptyMessage", "No matching suggestions.", { attr: "empty-message", alwaysPass: true }),
      bool("loading"),
      str("modelValue", "", { attr: "value", alwaysPass: true }),
      str("name"),
      bool("open"),
      str("placeholder"),
      bool("required"),
      arr("suggestions", "AutocompleteSuggestion[]")
    ]
  }),
  component("EmbAvatar", "emb-avatar", {
    vueProps: [str("alt"), str("name"), str("src")]
  }),
  component("EmbProgress", "emb-progress", {
    slots: slots.default,
    vueProps: [num("max", 100), num("value", 0)]
  }),
  component("EmbMeter", "emb-meter", {
    slots: slots.default,
    vueProps: [num("high", 100), num("low", 0), num("max", 100), num("min", 0), num("optimum", 100), num("value", 0)]
  }),
  component("EmbBreadcrumbs", "emb-breadcrumbs", { slots: slots.default }),
  component("EmbSkeleton", "emb-skeleton", {
    vueProps: [typed("variant", "SkeletonVariant", "line")]
  }),
  component("EmbStepper", "emb-stepper", {
    reactEvents: ["change", "input"],
    vueHandlers: textModelHandlers,
    vueProps: [
      bool("disabled"),
      bool("interactive"),
      typed("orientation", "StepperOrientation", "horizontal"),
      arr("steps", "StepperStep[]"),
      str("modelValue", "", { attr: "value", alwaysPass: true })
    ]
  }),
  component("EmbLink", "emb-link", {
    slots: slots.default,
    vueProps: [str("download"), str("href"), str("rel"), str("target")]
  }),
  component("EmbFieldset", "emb-fieldset", {
    slots: slots.all,
    vueProps: [bool("disabled"), str("legend")]
  }),
  component("EmbForm", "emb-form", {
    reactEvents: ["reset", "submit"],
    slots: slots.default,
    vueHandlers: [handler("reset"), handler("submit")],
    vueProps: [str("description"), str("error"), bool("submitting"), str("submittingLabel", "Submitting…", { attr: "submitting-label", alwaysPass: true }), str("success"), bool("validateOnSubmit", true, { attr: "validate-on-submit" })]
  }),
  component("EmbFormField", "emb-form-field", {
    slots: slots.all,
    vueProps: [str("description"), str("error"), str("label"), bool("required")]
  }),
  component("EmbFormRow", "emb-form-row", {
    slots: slots.default,
    vueProps: [num("columns", 2)]
  }),
  component("EmbHelperText", "emb-helper-text", { slots: slots.default }),
  component("EmbErrorText", "emb-error-text", { slots: slots.default }),
  component("EmbRange", "emb-range", {
    vueHandlers: numberModelHandlers,
    vueProps: [bool("disabled"), num("max", 100), num("min", 0), str("name"), bool("required"), num("step", 1), num("modelValue", 0, { attr: "value" })]
  }),
  component("EmbFileInput", "emb-file-input", {
    reactEvents: ["input", "change"],
    vueHandlers: [
      handler("input", {
        emitName: "input",
        modelEmit: "update:files",
        modelHostProperty: "files",
        modelHostType: "FileInputHost"
      }),
      handler("change", {
        emitName: "change",
        modelEmit: "update:files",
        modelHostProperty: "files",
        modelHostType: "FileInputHost"
      })
    ],
    vueProps: [str("accept"), bool("disabled"), bool("multiple"), str("name"), bool("required")]
  }),
  component("EmbFilterBuilder", "emb-filter-builder", {
    reactEvents: ["change", "input"],
    vueHandlers: textModelHandlers,
    vueProps: [bool("disabled"), arr("fields", "FilterBuilderField[]"), str("name"), str("modelValue", "", { attr: "value", alwaysPass: true })]
  }),
  component("EmbPagination", "emb-pagination", {
    reactEvents: ["change"],
    vueHandlers: [
      handler("change", {
        emitName: "change",
        modelEmit: "update:currentPage",
        modelHostProperty: "currentPage",
        modelHostType: "PageHost"
      })
    ],
    vueProps: [num("currentPage", 1), num("maxVisiblePages", 5), num("totalPages", 1)]
  }),
  component("EmbPageHeader", "emb-page-header", {
    slots: slots.all,
    vueProps: [str("description"), str("eyebrow"), str("title")]
  }),
  component("EmbPanelInspector", "emb-panel-inspector", {
    slots: slots.all,
    vueProps: [str("description"), bool("sticky"), str("title")]
  }),
  component("EmbDataTable", "emb-data-table", {
    reactEvents: ["cell-edit", "page-change", "row-action", "search-change", "sort-change"],
    vueHandlers: [
      handler("cell-edit"),
      handler("page-change", {
        emitName: "page-change",
        modelEmit: "update:currentPage",
        modelHostProperty: "currentPage",
        modelHostType: "PageHost"
      }),
      handler("row-action"),
      handler("search-change", {
        emitName: "search-change",
        modelEmit: "update:searchQuery",
        modelHostProperty: "searchQuery",
        modelHostType: "SearchQueryHost"
      })
    ],
    vueProps: [
      str("caption"),
      arr("columns", "DataTableColumn[]"),
      num("currentPage", 1),
      str("emptyMessage", "No rows to display.", { alwaysPass: true, attr: "emptyMessage" }),
      bool("loading"),
      num("pageSize", 10),
      arr("rows", "DataTableRow[]"),
      bool("searchable"),
      str("searchLabel", "Search rows", { alwaysPass: true }),
      str("searchPlaceholder", "Search rows", { alwaysPass: true }),
      str("searchQuery", ""),
      typed("sortDirection", "DataTableSortDirection", "ascending"),
      str("sortKey")
    ]
  }),
  component("EmbEmptyState", "emb-empty-state", { slots: slots.all }),
  component("EmbEmptySearchResults", "emb-empty-search-results", {
    slots: slots.all,
    vueProps: [str("description"), str("heading", "No matching results", { alwaysPass: true }), str("query")]
  }),
  component("EmbIcon", "emb-icon", {
    vueProps: [str("label"), str("name"), num("size", 20), num("strokeWidth", 2)]
  }),
  component("EmbCodeBlock", "emb-code-block", {
    slots: slots.default,
    vueProps: [str("code"), str("language")]
  }),
  component("EmbCommandBar", "emb-command-bar", {
    slots: slots.all,
    vueProps: [num("count", 0), str("countLabel", "selected", { attr: "count-label", alwaysPass: true }), str("description"), str("label"), bool("sticky")]
  }),
  component("EmbCommandPalette", "emb-command-palette", {
    reactEvents: ["cancel", "change", "close", "command-select", "input"],
    vueHandlers: [
      handler("input", {
        emitName: "input",
        modelEmit: "update:modelValue",
        modelHostProperty: "value",
        modelHostType: "InputHost"
      }),
      handler("change", {
        emitName: "change",
        modelEmit: "update:modelValue",
        modelHostProperty: "value",
        modelHostType: "InputHost"
      }),
      handler("close", {
        emitName: "close",
        modelEmit: "update:open",
        modelValueExpression: "false"
      }),
      handler("cancel", {
        emitName: "cancel",
        modelEmit: "update:open",
        modelValueExpression: "false"
      }),
      handler("command-select")
    ],
    vueProps: [
      arr("commands", "CommandPaletteCommand[]"),
      str("emptyMessage", "No matching commands.", { attr: "empty-message", alwaysPass: true }),
      str("modelValue", "", { attr: "value", alwaysPass: true }),
      bool("open"),
      str("placeholder", "Search commands", { alwaysPass: true }),
      str("query"),
      str("title", "Command palette", { alwaysPass: true })
    ]
  }),
  component("EmbContextMenu", "emb-context-menu", {
    slots: slots.all,
    vueHandlers: [currentOpen],
    vueProps: [bool("open")]
  }),
  component("EmbDatePicker", "emb-date-picker", {
    reactEvents: ["change", "input", "toggle"],
    vueHandlers: [...textModelHandlers, currentOpen],
    vueProps: [
      bool("disabled"),
      str("max"),
      str("min"),
      str("month"),
      str("modelValue", "", { attr: "value", alwaysPass: true }),
      str("name"),
      bool("open"),
      str("placeholder", "Select a date", { alwaysPass: true }),
      bool("required")
    ]
  }),
  component("EmbDateRangePicker", "emb-date-range-picker", {
    reactEvents: ["change", "input", "toggle"],
    vueHandlers: [handler("input"), handler("change"), currentOpen],
    vueProps: [
      str("endValue", "", { attr: "end-value" }),
      str("max"),
      str("min"),
      str("month"),
      bool("open"),
      str("placeholder", "Select a date range", { alwaysPass: true }),
      str("startValue", "", { attr: "start-value" })
    ]
  }),
  component("EmbDateTimePicker", "emb-date-time-picker", {
    reactEvents: ["change", "input"],
    vueHandlers: textModelHandlers,
    vueProps: [
      str("dateValue", "", { attr: "date-value" }),
      bool("disabled"),
      str("modelValue", "", { attr: "value", alwaysPass: true }),
      str("name"),
      bool("required"),
      str("timeValue", "", { attr: "time-value" })
    ]
  }),
  component("EmbListbox", "emb-listbox", {
    slots: slots.default,
    vueProps: [num("activeIndex", -1), bool("multiselectable"), str("selectedValue")]
  }),
  component("EmbDescriptionItem", "emb-description-item", {
    slots: slots.all
  }),
  component("EmbDescriptionList", "emb-description-list", {
    slots: slots.default
  }),
  component("EmbMenu", "emb-menu", { slots: slots.default }),
  component("EmbMenuItem", "emb-menu-item", {
    slots: slots.default,
    vueProps: [bool("disabled")]
  }),
  component("EmbMultiSelect", "emb-multi-select", {
    slots: slots.default,
    reactEvents: ["change", "input"],
    vueHandlers: [
      handler("input", {
        emitName: "input",
        modelEmit: "update:modelValue",
        modelHostProperty: "values",
        modelHostType: "HTMLElement & { values: string[] }"
      }),
      handler("change", {
        emitName: "change",
        modelEmit: "update:modelValue",
        modelHostProperty: "values",
        modelHostType: "HTMLElement & { values: string[] }"
      })
    ],
    vueProps: [bool("disabled"), str("name"), bool("open"), str("placeholder", "Select options", { alwaysPass: true }), bool("required"), arr("modelValue", "string[]", { attr: "values" })]
  }),
  component("EmbTagInput", "emb-tag-input", {
    reactEvents: ["change", "input"],
    vueHandlers: [
      handler("input", {
        emitName: "input",
        modelEmit: "update:modelValue",
        modelHostProperty: "values",
        modelHostType: "HTMLElement & { values: string[] }"
      }),
      handler("change", {
        emitName: "change",
        modelEmit: "update:modelValue",
        modelHostProperty: "values",
        modelHostType: "HTMLElement & { values: string[] }"
      })
    ],
    vueProps: [
      bool("disabled"),
      str("name"),
      str("placeholder", "Add a tag", { alwaysPass: true }),
      bool("required"),
      arr("modelValue", "string[]", { attr: "values" })
    ]
  }),
  component("EmbNumberInput", "emb-number-input", {
    vueHandlers: textModelHandlers,
    vueProps: [
      bool("disabled"),
      str("modelValue", "", { attr: "value", alwaysPass: true }),
      str("name"),
      str("startIcon", "", { attr: "start-icon" }),
      str("endIcon", "", { attr: "end-icon" }),
      str("placeholder"),
      bool("readonly"),
      bool("required"),
      str("max"),
      str("min"),
      str("step")
    ]
  }),
  component("EmbSearch", "emb-search", {
    vueHandlers: textModelHandlers,
    vueProps: inputStringProps({ includeIcons: true, startIconDefault: "search" }),
    reactEvents: ["change", "input"]
  }),
  component("EmbSplitter", "emb-splitter", {
    slots: slots.default,
    reactEvents: ["panel-resize"],
    vueHandlers: [handler("panel-resize")],
    vueProps: [typed("orientation", "SplitterOrientation", "horizontal")]
  }),
  component("EmbSplitterPanel", "emb-splitter-panel", {
    slots: slots.default,
    vueProps: [num("minSize", 10, { attr: "min-size" }), num("size", 0)]
  }),
  component("EmbSegmentedControl", "emb-segmented-control", {
    slots: slots.none,
    vueHandlers: textModelHandlers,
    vueProps: [bool("disabled"), str("modelValue", "", { attr: "value", alwaysPass: true }), str("name"), arr("options", "SegmentedControlOption[]"), bool("required")]
  }),
  component("EmbCombobox", "emb-combobox", {
    slots: slots.default,
    vueHandlers: textModelHandlers,
    vueProps: inputStringProps()
  }),
  component("EmbDateInput", "emb-date-input", {
    vueHandlers: textModelHandlers,
    vueProps: [
      bool("disabled"),
      str("max"),
      str("min"),
      str("modelValue", "", { attr: "value", alwaysPass: true }),
      str("name"),
      str("startIcon", "", { attr: "start-icon" }),
      str("endIcon", "", { attr: "end-icon" }),
      bool("readonly"),
      bool("required")
    ]
  }),
  component("EmbTimeInput", "emb-time-input", {
    vueHandlers: textModelHandlers,
    vueProps: [
      bool("disabled"),
      str("max"),
      str("min"),
      str("modelValue", "", { attr: "value", alwaysPass: true }),
      str("name"),
      str("startIcon", "", { attr: "start-icon" }),
      str("endIcon", "", { attr: "end-icon" }),
      bool("readonly"),
      bool("required"),
      str("step")
    ]
  }),
  component("EmbRatingInput", "emb-rating-input", {
    vueHandlers: numberModelHandlers,
    vueProps: [bool("clearable"), bool("disabled"), num("max", 5), num("modelValue", 0, { attr: "value" }), str("name"), bool("required")]
  }),
  component("EmbToast", "emb-toast", {
    slots: slots.default,
    vueHandlers: [
      handler("close", {
        emitName: "close",
        modelEmit: "update:open",
        modelValueExpression: "false"
      })
    ],
    vueProps: [bool("dismissible"), bool("open", true), typed("tone", '"neutral" | "success" | "warning" | "danger"', "neutral")]
  }),
  component("EmbToastRegion", "emb-toast-region", {
    slots: slots.all,
    vueHandlers: [handler("toast-show"), handler("toast-remove")],
    vueProps: [num("maxVisible", 5), typed("placement", "ToastPlacement", "top-end")]
  }),
  component("EmbTooltip", "emb-tooltip", {
    slots: slots.default,
    vueProps: [bool("open"), str("text")]
  }),
  component("EmbToolbar", "emb-toolbar", {
    slots: slots.default,
    vueProps: [typed("orientation", "ToolbarOrientation", "horizontal"), bool("wrap")]
  }),
  component("EmbPopover", "emb-popover", {
    slots: slots.default,
    vueHandlers: [currentOpen],
    vueProps: [bool("open")]
  }),
  component("EmbDropdownMenu", "emb-dropdown-menu", {
    slots: slots.default,
    vueHandlers: [currentOpen],
    vueProps: [bool("open")]
  }),
  component("EmbDropzone", "emb-dropzone", {
    reactEvents: ["input", "change"],
    vueHandlers: [
      handler("input", {
        emitName: "input",
        modelEmit: "update:files",
        modelHostProperty: "files",
        modelHostType: "FileInputHost"
      }),
      handler("change", {
        emitName: "change",
        modelEmit: "update:files",
        modelHostProperty: "files",
        modelHostType: "FileInputHost"
      })
    ],
    vueProps: [str("accept"), bool("disabled"), bool("multiple"), str("name"), bool("required")]
  }),
  component("EmbDrawer", "emb-drawer", {
    slots: slots.default,
    vueHandlers: [
      handler("close", {
        emitName: "close",
        modelEmit: "update:open",
        modelValueExpression: "false"
      })
    ],
    vueProps: [bool("open"), typed("side", '"start" | "end"', "end")]
  }),
  component("EmbInput", "emb-input", {
    vueHandlers: textModelHandlers,
    vueProps: [...inputStringProps({ includeIcons: true }), str("type", "text", { alwaysPass: true })]
  }),
  component("EmbInlineEdit", "emb-inline-edit", {
    reactEvents: ["cancel", "change", "input", "toggle"],
    vueHandlers: [
      ...textModelHandlers,
      handler("cancel"),
      handler("toggle", {
        emitName: "toggle",
        modelEmit: "update:editing",
        modelHostProperty: "editing",
        modelHostType: "HTMLElement & { editing: boolean }"
      })
    ],
    vueProps: [bool("disabled"), bool("editing"), str("modelValue", "", { attr: "value", alwaysPass: true }), str("placeholder", "Click edit", { alwaysPass: true })]
  }),
  component("EmbLayout", "emb-layout", {
    slots: slots.default
  }),
  component("EmbLayoutContent", "emb-layout-content", {
    slots: slots.default
  }),
  component("EmbLayoutHeader", "emb-layout-header", {
    slots: slots.default
  }),
  component("EmbEmailInput", "emb-email-input", {
    vueHandlers: textModelHandlers,
    vueProps: inputStringProps({ autocompleteDefault: "email", includeIcons: true })
  }),
  component("EmbPasswordInput", "emb-password-input", {
    vueHandlers: textModelHandlers,
    vueProps: inputStringProps({ autocompleteDefault: "current-password" })
  }),
  component("EmbOption", "emb-option", {
    slots: slots.default,
    vueProps: [bool("active"), bool("disabled"), str("label"), bool("selected"), str("value")]
  }),
  component("EmbMenubar", "emb-menubar", {
    slots: slots.default
  }),
  component("EmbNavigationRail", "emb-navigation-rail", {
    slots: slots.default
  }),
  component("EmbNavigationRailItem", "emb-navigation-rail-item", {
    slots: slots.all,
    vueProps: [bool("current"), bool("disabled"), str("href"), str("label"), str("rel"), str("target"), str("value")]
  }),
  component("EmbTelInput", "emb-tel-input", {
    vueHandlers: textModelHandlers,
    vueProps: inputStringProps({ autocompleteDefault: "tel", includeIcons: true })
  }),
  component("EmbUrlInput", "emb-url-input", {
    vueHandlers: textModelHandlers,
    vueProps: inputStringProps({ autocompleteDefault: "url", includeIcons: true })
  }),
  component("EmbColorInput", "emb-color-input", {
    vueHandlers: textModelHandlers,
    vueProps: [bool("disabled"), str("modelValue", "#4f46e5", { attr: "value", alwaysPass: true }), str("name")]
  }),
  component("EmbCheckbox", "emb-checkbox", {
    slots: slots.default,
    vueHandlers: checkedModelHandlers,
    vueProps: [bool("modelValue", false, { attr: "checked" }), bool("disabled"), str("name"), bool("required"), str("value", "on", { alwaysPass: true })]
  }),
  component("EmbSelect", "emb-select", {
    slots: slots.default,
    vueHandlers: [
      handler("input", {
        emitName: "input",
        modelEmit: "update:modelValue",
        modelHostProperty: "value",
        modelHostType: "SelectHost"
      }),
      handler("change", {
        emitName: "change",
        modelEmit: "update:modelValue",
        modelHostProperty: "value",
        modelHostType: "SelectHost"
      })
    ],
    vueProps: [bool("disabled"), str("modelValue", "", { attr: "value", alwaysPass: true }), str("name"), bool("required")]
  }),
  component("EmbStack", "emb-stack", {
    slots: slots.default,
    vueProps: [
      typed("align", "StackAlign", "stretch"),
      typed("direction", "StackDirection", "vertical"),
      typed("gap", "StackGap", "3"),
      typed("justify", "StackJustify", "start"),
      bool("wrap")
    ]
  }),
  component("EmbRadio", "emb-radio", {
    slots: slots.default,
    vueHandlers: [
      handler("input", {
        emitName: "input",
        modelEmit: "update:checked",
        modelHostProperty: "checked",
        modelHostType: "CheckboxHost"
      }),
      handler("change", {
        emitName: "change",
        modelEmit: "update:checked",
        modelHostProperty: "checked",
        modelHostType: "CheckboxHost"
      })
    ],
    vueProps: [bool("checked"), bool("disabled"), str("name"), bool("required"), str("value", "on", { alwaysPass: true })]
  }),
  component("EmbDialog", "emb-dialog", {
    slots: slots.default,
    vueHandlers: [
      handler("close", {
        emitName: "close",
        modelEmit: "update:open",
        modelValueExpression: "false"
      }),
      handler("cancel", {
        emitName: "cancel",
        modelEmit: "update:open",
        modelValueExpression: "false"
      })
    ],
    vueProps: [bool("modal", true), bool("open")]
  }),
  component("EmbTextarea", "emb-textarea", {
    vueHandlers: textModelHandlers,
    vueProps: [bool("disabled"), str("modelValue", "", { attr: "value", alwaysPass: true }), str("name"), str("placeholder"), bool("readonly"), bool("required"), num("rows", 4)]
  }),
  component("EmbSwitch", "emb-switch", {
    slots: slots.default,
    vueHandlers: checkedModelHandlers,
    vueProps: [bool("disabled"), bool("modelValue", false, { attr: "checked" }), str("name"), bool("required"), str("value", "on", { alwaysPass: true })]
  }),
  component("EmbTabPanel", "emb-tab-panel", {
    slots: slots.default,
    vueProps: [str("label"), str("value")]
  }),
  component("EmbTabs", "emb-tabs", {
    slots: slots.default,
    vueHandlers: [
      handler("change", {
        emitName: "change",
        modelEmit: "update:value",
        modelHostProperty: "value",
        modelHostType: "SelectHost"
      })
    ],
    vueProps: [str("value")]
  }),
  component("EmbAccordion", "emb-accordion", {
    slots: slots.default,
    vueHandlers: [
      handler("toggle", {
        emitName: "toggle",
        modelEmit: "update:open",
        modelHostProperty: "open",
        modelHostType: "OpenHost"
      })
    ],
    vueProps: [bool("open")]
  }),
  component("EmbTreeItem", "emb-tree-item", {
    slots: slots.all,
    vueProps: [bool("disabled"), bool("expanded"), str("label"), bool("selected"), str("value")]
  }),
  component("EmbTreeView", "emb-tree-view", {
    slots: slots.default,
    reactEvents: ["change", "input"],
    vueHandlers: textModelHandlers,
    vueProps: [str("modelValue", "", { attr: "value", alwaysPass: true })]
  }),
  component("EmbStatCard", "emb-stat-card", {
    slots: slots.default,
    vueProps: [str("change"), str("label"), typed("tone", "StatCardTone", "neutral"), str("value")]
  }),
  component("EmbTimeline", "emb-timeline", {
    slots: slots.default
  }),
  component("EmbTimelineItem", "emb-timeline-item", {
    slots: slots.all
  }),
  component("EmbTransferList", "emb-transfer-list", {
    slots: slots.default,
    reactEvents: ["change", "input"],
    vueHandlers: [
      handler("input", {
        emitName: "input",
        modelEmit: "update:modelValue",
        modelHostProperty: "selectedValues",
        modelHostType: "HTMLElement & { selectedValues: string[] }"
      }),
      handler("change", {
        emitName: "change",
        modelEmit: "update:modelValue",
        modelHostProperty: "selectedValues",
        modelHostType: "HTMLElement & { selectedValues: string[] }"
      })
    ],
    vueProps: [
      str("availableLabel", "Available", { attr: "available-label", alwaysPass: true }),
      bool("disabled"),
      str("name"),
      bool("required"),
      str("selectedLabel", "Selected", { attr: "selected-label", alwaysPass: true }),
      arr("modelValue", "string[]", { attr: "selected-values" }),
      num("size", 8)
    ]
  }),
  component("EmbSideNav", "emb-side-nav", {
    slots: slots.default
  }),
  component("EmbSideNavItem", "emb-side-nav-item", {
    slots: slots.all,
    vueProps: [bool("current"), bool("disabled"), bool("expanded"), str("href"), str("label"), str("rel"), str("target"), str("value")]
  })
];
