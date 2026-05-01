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
  component("CindorButton", "cindor-button", {
    slots: slots.all,
    vueProps: [bool("disabled"), bool("iconOnly"), typed("type", "ButtonType", "button"), typed("variant", "ButtonVariant", "solid")]
  }),
  component("CindorButtonGroup", "cindor-button-group", {
    slots: slots.default,
    vueProps: [bool("attached"), typed("orientation", "ButtonGroupOrientation", "horizontal")]
  }),
  component("CindorChip", "cindor-chip", {
    slots: slots.default,
    vueProps: [typed("tone", "ChipTone", "neutral")]
  }),
  component("CindorTag", "cindor-tag", {
    slots: slots.default,
    vueHandlers: [handler("remove")],
    vueProps: [bool("dismissible"), str("removeLabel", "Remove tag", { attr: "remove-label", alwaysPass: true }), typed("tone", "TagTone", "accent")]
  }),
  component("CindorIconButton", "cindor-icon-button", {
    vueProps: [
      bool("disabled"),
      str("label"),
      typed("name", "LucideIconName | string", ""),
      num("size", 16),
      num("strokeWidth", 2, { attr: "stroke-width" }),
      typed("type", "ButtonType", "button")
    ]
  }),
  component("CindorCard", "cindor-card", { slots: slots.default }),
  component("CindorCalendar", "cindor-calendar", {
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
  component("CindorBadge", "cindor-badge", {
    slots: slots.default,
    vueProps: [typed("tone", '"neutral" | "accent" | "success"', "neutral")]
  }),
  component("CindorDivider", "cindor-divider"),
  component("CindorProvider", "cindor-provider", {
    slots: slots.default,
    vueProps: [
      typed("colorScheme", "ProviderColorScheme", "inherit", { attr: "color-scheme" }),
      typed("theme", "ProviderTheme", "inherit")
    ]
  }),
  component("CindorSpinner", "cindor-spinner"),
  component("CindorAlert", "cindor-alert", {
    slots: slots.default,
    vueProps: [typed("tone", '"info" | "success" | "warning" | "danger"', "info")]
  }),
  component("CindorActivityFeed", "cindor-activity-feed", {
    slots: slots.default
  }),
  component("CindorActivityItem", "cindor-activity-item", {
    slots: slots.all,
    vueProps: [bool("unread")]
  }),
  component("CindorAutocomplete", "cindor-autocomplete", {
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
  component("CindorAvatar", "cindor-avatar", {
    vueProps: [str("alt"), str("name"), str("src")]
  }),
  component("CindorProgress", "cindor-progress", {
    slots: slots.default,
    vueProps: [num("max", 100), num("value", 0)]
  }),
  component("CindorMeter", "cindor-meter", {
    slots: slots.default,
    vueProps: [num("high", 100), num("low", 0), num("max", 100), num("min", 0), num("optimum", 100), num("value", 0)]
  }),
  component("CindorBreadcrumbs", "cindor-breadcrumbs", { slots: slots.default }),
  component("CindorSkeleton", "cindor-skeleton", {
    vueProps: [typed("variant", "SkeletonVariant", "line")]
  }),
  component("CindorStepper", "cindor-stepper", {
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
  component("CindorLink", "cindor-link", {
    slots: slots.default,
    vueProps: [str("download"), str("href"), str("rel"), str("target")]
  }),
  component("CindorFieldset", "cindor-fieldset", {
    slots: slots.all,
    vueProps: [bool("disabled"), str("legend")]
  }),
  component("CindorForm", "cindor-form", {
    reactEvents: ["reset", "submit"],
    slots: slots.default,
    vueHandlers: [handler("reset"), handler("submit")],
    vueProps: [str("description"), str("error"), bool("submitting"), str("submittingLabel", "Submitting…", { attr: "submitting-label", alwaysPass: true }), str("success"), bool("validateOnSubmit", true, { attr: "validate-on-submit" })]
  }),
  component("CindorFormField", "cindor-form-field", {
    slots: slots.all,
    vueProps: [str("description"), str("error"), str("label"), bool("required")]
  }),
  component("CindorFormRow", "cindor-form-row", {
    slots: slots.default,
    vueProps: [num("columns", 2)]
  }),
  component("CindorHelperText", "cindor-helper-text", { slots: slots.default }),
  component("CindorErrorText", "cindor-error-text", { slots: slots.default }),
  component("CindorRange", "cindor-range", {
    vueHandlers: numberModelHandlers,
    vueProps: [bool("disabled"), num("max", 100), num("min", 0), str("name"), bool("required"), num("step", 1), num("modelValue", 0, { attr: "value" })]
  }),
  component("CindorFileInput", "cindor-file-input", {
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
  component("CindorFilterBuilder", "cindor-filter-builder", {
    reactEvents: ["change", "input"],
    vueHandlers: textModelHandlers,
    vueProps: [bool("disabled"), arr("fields", "FilterBuilderField[]"), str("name"), str("modelValue", "", { attr: "value", alwaysPass: true })]
  }),
  component("CindorPagination", "cindor-pagination", {
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
  component("CindorPageHeader", "cindor-page-header", {
    slots: slots.all,
    vueProps: [str("description"), str("eyebrow"), str("title")]
  }),
  component("CindorPanelInspector", "cindor-panel-inspector", {
    slots: slots.all,
    vueProps: [str("description"), bool("sticky"), str("title")]
  }),
  component("CindorDataTable", "cindor-data-table", {
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
  component("CindorEmptyState", "cindor-empty-state", { slots: slots.all }),
  component("CindorEmptySearchResults", "cindor-empty-search-results", {
    slots: slots.all,
    vueProps: [str("description"), str("heading", "No matching results", { alwaysPass: true }), str("query")]
  }),
  component("CindorIcon", "cindor-icon", {
    vueProps: [str("label"), str("name"), num("size", 20), num("strokeWidth", 2)]
  }),
  component("CindorCodeBlock", "cindor-code-block", {
    slots: slots.default,
    vueProps: [str("code"), str("language")]
  }),
  component("CindorCommandBar", "cindor-command-bar", {
    slots: slots.all,
    vueProps: [num("count", 0), str("countLabel", "selected", { attr: "count-label", alwaysPass: true }), str("description"), str("label"), bool("sticky")]
  }),
  component("CindorCommandPalette", "cindor-command-palette", {
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
  component("CindorContextMenu", "cindor-context-menu", {
    slots: slots.all,
    vueHandlers: [currentOpen],
    vueProps: [bool("open")]
  }),
  component("CindorDatePicker", "cindor-date-picker", {
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
  component("CindorDateRangePicker", "cindor-date-range-picker", {
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
  component("CindorDateTimePicker", "cindor-date-time-picker", {
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
  component("CindorListbox", "cindor-listbox", {
    slots: slots.default,
    vueProps: [num("activeIndex", -1), bool("multiselectable"), str("selectedValue")]
  }),
  component("CindorDescriptionItem", "cindor-description-item", {
    slots: slots.all
  }),
  component("CindorDescriptionList", "cindor-description-list", {
    slots: slots.default
  }),
  component("CindorMenu", "cindor-menu", { slots: slots.default }),
  component("CindorMenuItem", "cindor-menu-item", {
    slots: slots.default,
    vueProps: [bool("disabled")]
  }),
  component("CindorMultiSelect", "cindor-multi-select", {
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
  component("CindorTagInput", "cindor-tag-input", {
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
  component("CindorNumberInput", "cindor-number-input", {
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
  component("CindorSearch", "cindor-search", {
    vueHandlers: textModelHandlers,
    vueProps: inputStringProps({ includeIcons: true, startIconDefault: "search" }),
    reactEvents: ["change", "input"]
  }),
  component("CindorSplitter", "cindor-splitter", {
    slots: slots.default,
    reactEvents: ["panel-resize"],
    vueHandlers: [handler("panel-resize")],
    vueProps: [typed("orientation", "SplitterOrientation", "horizontal")]
  }),
  component("CindorSplitterPanel", "cindor-splitter-panel", {
    slots: slots.default,
    vueProps: [num("minSize", 10, { attr: "min-size" }), num("size", 0)]
  }),
  component("CindorSegmentedControl", "cindor-segmented-control", {
    slots: slots.none,
    vueHandlers: textModelHandlers,
    vueProps: [bool("disabled"), str("modelValue", "", { attr: "value", alwaysPass: true }), str("name"), arr("options", "SegmentedControlOption[]"), bool("required")]
  }),
  component("CindorCombobox", "cindor-combobox", {
    slots: slots.default,
    vueHandlers: textModelHandlers,
    vueProps: inputStringProps()
  }),
  component("CindorDateInput", "cindor-date-input", {
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
  component("CindorTimeInput", "cindor-time-input", {
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
  component("CindorRatingInput", "cindor-rating-input", {
    vueHandlers: numberModelHandlers,
    vueProps: [bool("clearable"), bool("disabled"), num("max", 5), num("modelValue", 0, { attr: "value" }), str("name"), bool("required")]
  }),
  component("CindorToast", "cindor-toast", {
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
  component("CindorToastRegion", "cindor-toast-region", {
    slots: slots.all,
    vueHandlers: [handler("toast-show"), handler("toast-remove")],
    vueProps: [num("maxVisible", 5), typed("placement", "ToastPlacement", "top-end")]
  }),
  component("CindorTooltip", "cindor-tooltip", {
    slots: slots.default,
    vueProps: [bool("open"), str("text")]
  }),
  component("CindorToolbar", "cindor-toolbar", {
    slots: slots.default,
    vueProps: [typed("orientation", "ToolbarOrientation", "horizontal"), bool("wrap")]
  }),
  component("CindorPopover", "cindor-popover", {
    slots: slots.default,
    vueHandlers: [currentOpen],
    vueProps: [bool("open")]
  }),
  component("CindorDropdownMenu", "cindor-dropdown-menu", {
    slots: slots.default,
    vueHandlers: [currentOpen],
    vueProps: [bool("open")]
  }),
  component("CindorDropzone", "cindor-dropzone", {
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
  component("CindorDrawer", "cindor-drawer", {
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
  component("CindorInput", "cindor-input", {
    vueHandlers: textModelHandlers,
    vueProps: [...inputStringProps({ includeIcons: true }), str("type", "text", { alwaysPass: true })]
  }),
  component("CindorInlineEdit", "cindor-inline-edit", {
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
  component("CindorLayout", "cindor-layout", {
    slots: slots.default
  }),
  component("CindorLayoutContent", "cindor-layout-content", {
    slots: slots.default
  }),
  component("CindorLayoutHeader", "cindor-layout-header", {
    slots: slots.default
  }),
  component("CindorEmailInput", "cindor-email-input", {
    vueHandlers: textModelHandlers,
    vueProps: inputStringProps({ autocompleteDefault: "email", includeIcons: true })
  }),
  component("CindorPasswordInput", "cindor-password-input", {
    vueHandlers: textModelHandlers,
    vueProps: inputStringProps({ autocompleteDefault: "current-password" })
  }),
  component("CindorOption", "cindor-option", {
    slots: slots.default,
    vueProps: [bool("active"), bool("disabled"), str("label"), bool("selected"), str("value")]
  }),
  component("CindorMenubar", "cindor-menubar", {
    slots: slots.default
  }),
  component("CindorNavigationRail", "cindor-navigation-rail", {
    slots: slots.default
  }),
  component("CindorNavigationRailItem", "cindor-navigation-rail-item", {
    slots: slots.all,
    vueProps: [bool("current"), bool("disabled"), str("href"), str("label"), str("rel"), str("target"), str("value")]
  }),
  component("CindorTelInput", "cindor-tel-input", {
    vueHandlers: textModelHandlers,
    vueProps: inputStringProps({ autocompleteDefault: "tel", includeIcons: true })
  }),
  component("CindorUrlInput", "cindor-url-input", {
    vueHandlers: textModelHandlers,
    vueProps: inputStringProps({ autocompleteDefault: "url", includeIcons: true })
  }),
  component("CindorColorInput", "cindor-color-input", {
    vueHandlers: textModelHandlers,
    vueProps: [bool("disabled"), str("modelValue", "#4f46e5", { attr: "value", alwaysPass: true }), str("name")]
  }),
  component("CindorCheckbox", "cindor-checkbox", {
    slots: slots.default,
    vueHandlers: checkedModelHandlers,
    vueProps: [bool("modelValue", false, { attr: "checked" }), bool("disabled"), str("name"), bool("required"), str("value", "on", { alwaysPass: true })]
  }),
  component("CindorSelect", "cindor-select", {
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
  component("CindorStack", "cindor-stack", {
    slots: slots.default,
    vueProps: [
      typed("align", "StackAlign", "stretch"),
      typed("direction", "StackDirection", "vertical"),
      typed("gap", "StackGap", "3"),
      typed("justify", "StackJustify", "start"),
      bool("wrap")
    ]
  }),
  component("CindorRadio", "cindor-radio", {
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
  component("CindorDialog", "cindor-dialog", {
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
  component("CindorTextarea", "cindor-textarea", {
    vueHandlers: textModelHandlers,
    vueProps: [bool("disabled"), str("modelValue", "", { attr: "value", alwaysPass: true }), str("name"), str("placeholder"), bool("readonly"), bool("required"), num("rows", 4)]
  }),
  component("CindorSwitch", "cindor-switch", {
    slots: slots.default,
    vueHandlers: checkedModelHandlers,
    vueProps: [bool("disabled"), bool("modelValue", false, { attr: "checked" }), str("name"), bool("required"), str("value", "on", { alwaysPass: true })]
  }),
  component("CindorTabPanel", "cindor-tab-panel", {
    slots: slots.default,
    vueProps: [str("label"), str("value")]
  }),
  component("CindorTabs", "cindor-tabs", {
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
  component("CindorAccordion", "cindor-accordion", {
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
  component("CindorTreeItem", "cindor-tree-item", {
    slots: slots.all,
    vueProps: [bool("disabled"), bool("expanded"), str("label"), bool("selected"), str("value")]
  }),
  component("CindorTreeView", "cindor-tree-view", {
    slots: slots.default,
    reactEvents: ["change", "input"],
    vueHandlers: textModelHandlers,
    vueProps: [str("modelValue", "", { attr: "value", alwaysPass: true })]
  }),
  component("CindorStatCard", "cindor-stat-card", {
    slots: slots.default,
    vueProps: [str("change"), str("label"), typed("tone", "StatCardTone", "neutral"), str("value")]
  }),
  component("CindorTimeline", "cindor-timeline", {
    slots: slots.default
  }),
  component("CindorTimelineItem", "cindor-timeline-item", {
    slots: slots.all
  }),
  component("CindorTransferList", "cindor-transfer-list", {
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
  component("CindorSideNav", "cindor-side-nav", {
    slots: slots.default
  }),
  component("CindorSideNavItem", "cindor-side-nav-item", {
    slots: slots.all,
    vueProps: [bool("current"), bool("disabled"), bool("expanded"), str("href"), str("label"), str("rel"), str("target"), str("value")]
  })
];
