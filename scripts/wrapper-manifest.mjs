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
  component("EmbSpinner", "emb-spinner"),
  component("EmbAlert", "emb-alert", {
    slots: slots.default,
    vueProps: [typed("tone", '"info" | "success" | "warning" | "danger"', "info")]
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
  component("EmbFormField", "emb-form-field", {
    slots: slots.all,
    vueProps: [str("description"), str("error"), str("label"), bool("required")]
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
  component("EmbDataTable", "emb-data-table", {
    reactEvents: ["page-change", "search-change", "sort-change"],
    vueHandlers: [
      handler("page-change", {
        emitName: "page-change",
        modelEmit: "update:currentPage",
        modelHostProperty: "currentPage",
        modelHostType: "PageHost"
      }),
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
  component("EmbIcon", "emb-icon", {
    vueProps: [str("label"), str("name"), num("size", 20), num("strokeWidth", 2)]
  }),
  component("EmbCodeBlock", "emb-code-block", {
    slots: slots.default,
    vueProps: [str("code"), str("language")]
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
  component("EmbListbox", "emb-listbox", {
    slots: slots.default,
    vueProps: [num("activeIndex", -1), bool("multiselectable"), str("selectedValue")]
  }),
  component("EmbMenu", "emb-menu", { slots: slots.default }),
  component("EmbMenuItem", "emb-menu-item", {
    slots: slots.default,
    vueProps: [bool("disabled")]
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
  component("EmbTelInput", "emb-tel-input", {
    vueHandlers: textModelHandlers,
    vueProps: inputStringProps({ autocompleteDefault: "tel", includeIcons: true })
  }),
  component("EmbTag", "emb-tag", {
    slots: slots.default,
    vueProps: [typed("tone", "ChipTone", "accent")]
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
  })
];
