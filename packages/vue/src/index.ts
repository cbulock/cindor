import { defineComponent, h, type PropType } from "vue";

import type { ButtonType, ButtonVariant, SkeletonVariant, ToastPlacement } from "emberline-ui-core";
export { clearToasts, dismissToast, ensureToastRegion, showToast } from "emberline-ui-core";
import "emberline-ui-core/register";

type InputHost = HTMLElement & { value: string };
type CheckboxHost = HTMLElement & { checked: boolean };
type SelectHost = HTMLElement & { value: string };
type OpenHost = HTMLElement & { open: boolean };
type FileInputHost = HTMLElement & { files: FileList | null };
type PageHost = HTMLElement & { currentPage: number };

export const EmbButton = defineComponent({
  name: "EmbButton",
  props: {
    disabled: { type: Boolean, default: false },
    type: { type: String as PropType<ButtonType>, default: "button" },
    variant: { type: String as PropType<ButtonVariant>, default: "solid" }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "emb-button",
        {
          ...attrs,
          disabled: props.disabled || undefined,
          type: props.type,
          variant: props.variant
        },
        slots.default?.()
      );
  }
});

export const EmbCard = defineComponent({
  name: "EmbCard",
  setup(_, { attrs, slots }) {
    return () => h("emb-card", { ...attrs }, slots.default?.());
  }
});

export const EmbBadge = defineComponent({
  name: "EmbBadge",
  props: {
    tone: { type: String as PropType<"neutral" | "accent" | "success">, default: "neutral" }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "emb-badge",
        {
          ...attrs,
          tone: props.tone
        },
        slots.default?.()
      );
  }
});

export const EmbDivider = defineComponent({
  name: "EmbDivider",
  setup(_, { attrs }) {
    return () => h("emb-divider", { ...attrs });
  }
});

export const EmbSpinner = defineComponent({
  name: "EmbSpinner",
  setup(_, { attrs }) {
    return () => h("emb-spinner", { ...attrs });
  }
});

export const EmbAlert = defineComponent({
  name: "EmbAlert",
  props: {
    tone: { type: String as PropType<"info" | "success" | "warning" | "danger">, default: "info" }
  },
  setup(props, { attrs, slots }) {
    return () => h("emb-alert", { ...attrs, tone: props.tone }, slots.default?.());
  }
});

export const EmbAvatar = defineComponent({
  name: "EmbAvatar",
  props: {
    alt: { type: String, default: "" },
    name: { type: String, default: "" },
    src: { type: String, default: "" }
  },
  setup(props, { attrs }) {
    return () =>
      h("emb-avatar", {
        ...attrs,
        alt: props.alt || undefined,
        name: props.name || undefined,
        src: props.src || undefined
      });
  }
});

export const EmbProgress = defineComponent({
  name: "EmbProgress",
  props: {
    max: { type: Number, default: 100 },
    value: { type: Number, default: 0 }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "emb-progress",
        {
          ...attrs,
          max: props.max,
          value: props.value
        },
        slots.default?.()
      );
  }
});

export const EmbMeter = defineComponent({
  name: "EmbMeter",
  props: {
    high: { type: Number, default: 100 },
    low: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    min: { type: Number, default: 0 },
    optimum: { type: Number, default: 100 },
    value: { type: Number, default: 0 }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "emb-meter",
        {
          ...attrs,
          high: props.high,
          low: props.low,
          max: props.max,
          min: props.min,
          optimum: props.optimum,
          value: props.value
        },
        slots.default?.()
      );
  }
});

export const EmbBreadcrumbs = defineComponent({
  name: "EmbBreadcrumbs",
  setup(_, { attrs, slots }) {
    return () => h("emb-breadcrumbs", { ...attrs }, slots.default?.());
  }
});

export const EmbSkeleton = defineComponent({
  name: "EmbSkeleton",
  props: {
    variant: { type: String as PropType<SkeletonVariant>, default: "line" }
  },
  setup(props, { attrs }) {
    return () =>
      h("emb-skeleton", {
        ...attrs,
        variant: props.variant
      });
  }
});

export const EmbLink = defineComponent({
  name: "EmbLink",
  props: {
    download: { type: String, default: "" },
    href: { type: String, default: "" },
    rel: { type: String, default: "" },
    target: { type: String, default: "" }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "emb-link",
        {
          ...attrs,
          download: props.download || undefined,
          href: props.href || undefined,
          rel: props.rel || undefined,
          target: props.target || undefined
        },
        slots.default?.()
      );
  }
});

export const EmbFieldset = defineComponent({
  name: "EmbFieldset",
  props: {
    disabled: { type: Boolean, default: false },
    legend: { type: String, default: "" }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "emb-fieldset",
        {
          ...attrs,
          disabled: props.disabled || undefined,
          legend: props.legend || undefined
        },
        slots
      );
  }
});

export const EmbRange = defineComponent({
  name: "EmbRange",
  props: {
    disabled: { type: Boolean, default: false },
    max: { type: Number, default: 100 },
    min: { type: Number, default: 0 },
    modelValue: { type: Number, default: 0 },
    name: { type: String, default: "" },
    required: { type: Boolean, default: false },
    step: { type: Number, default: 1 }
  },
  emits: ["update:modelValue", "input", "change"],
  setup(props, { attrs, emit }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", Number(target.value));
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", Number(target.value));
      emit("change", event);
    };

    return () =>
      h("emb-range", {
        ...attrs,
        disabled: props.disabled || undefined,
        max: props.max,
        min: props.min,
        name: props.name || undefined,
        required: props.required || undefined,
        step: props.step,
        value: props.modelValue,
        onInput: handleInput,
        onChange: handleChange
      });
  }
});

export const EmbFileInput = defineComponent({
  name: "EmbFileInput",
  props: {
    accept: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    name: { type: String, default: "" },
    required: { type: Boolean, default: false }
  },
  emits: ["input", "change", "update:files"],
  setup(props, { attrs, emit }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as FileInputHost;
      emit("update:files", target.files);
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as FileInputHost;
      emit("update:files", target.files);
      emit("change", event);
    };

    return () =>
      h("emb-file-input", {
        ...attrs,
        accept: props.accept || undefined,
        disabled: props.disabled || undefined,
        multiple: props.multiple || undefined,
        name: props.name || undefined,
        required: props.required || undefined,
        onInput: handleInput,
        onChange: handleChange
      });
  }
});

export const EmbPagination = defineComponent({
  name: "EmbPagination",
  props: {
    currentPage: { type: Number, default: 1 },
    maxVisiblePages: { type: Number, default: 5 },
    totalPages: { type: Number, default: 1 }
  },
  emits: ["update:currentPage", "change"],
  setup(props, { attrs, emit }) {
    const handleChange = (event: Event) => {
      const target = event.currentTarget as PageHost;
      emit("update:currentPage", target.currentPage);
      emit("change", event);
    };

    return () =>
      h("emb-pagination", {
        ...attrs,
        currentPage: props.currentPage,
        maxVisiblePages: props.maxVisiblePages,
        totalPages: props.totalPages,
        onChange: handleChange
      });
  }
});

export const EmbEmptyState = defineComponent({
  name: "EmbEmptyState",
  setup(_, { attrs, slots }) {
    return () => h("emb-empty-state", { ...attrs }, slots);
  }
});

export const EmbIcon = defineComponent({
  name: "EmbIcon",
  props: {
    label: { type: String, default: "" },
    name: { type: String, default: "" },
    size: { type: Number, default: 20 },
    strokeWidth: { type: Number, default: 2 }
  },
  setup(props, { attrs }) {
    return () =>
      h("emb-icon", {
        ...attrs,
        label: props.label || undefined,
        name: props.name || undefined,
        size: props.size,
        strokeWidth: props.strokeWidth
      });
  }
});

export const EmbCodeBlock = defineComponent({
  name: "EmbCodeBlock",
  props: {
    code: { type: String, default: "" }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "emb-code-block",
        {
          ...attrs,
          code: props.code || undefined
        },
        slots.default?.()
      );
  }
});

export const EmbNumberInput = defineComponent({
  name: "EmbNumberInput",
  props: {
    disabled: { type: Boolean, default: false },
    max: { type: String, default: "" },
    min: { type: String, default: "" },
    modelValue: { type: String, default: "" },
    name: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    step: { type: String, default: "" }
  },
  emits: ["update:modelValue", "input", "change"],
  setup(props, { attrs, emit }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("change", event);
    };

    return () =>
      h("emb-number-input", {
        ...attrs,
        disabled: props.disabled || undefined,
        max: props.max || undefined,
        min: props.min || undefined,
        name: props.name || undefined,
        placeholder: props.placeholder || undefined,
        readonly: props.readonly || undefined,
        required: props.required || undefined,
        step: props.step || undefined,
        value: props.modelValue,
        onInput: handleInput,
        onChange: handleChange
      });
  }
});

export const EmbSearch = defineComponent({
  name: "EmbSearch",
  props: {
    autocomplete: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
    modelValue: { type: String, default: "" },
    name: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "input", "change"],
  setup(props, { attrs, emit }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("change", event);
    };

    return () =>
      h("emb-search", {
        ...attrs,
        autocomplete: props.autocomplete || undefined,
        disabled: props.disabled || undefined,
        name: props.name || undefined,
        placeholder: props.placeholder || undefined,
        readonly: props.readonly || undefined,
        required: props.required || undefined,
        value: props.modelValue,
        onInput: handleInput,
        onChange: handleChange
      });
  }
});

export const EmbCombobox = defineComponent({
  name: "EmbCombobox",
  props: {
    autocomplete: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
    modelValue: { type: String, default: "" },
    name: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "input", "change"],
  setup(props, { attrs, emit, slots }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("change", event);
    };

    return () =>
      h(
        "emb-combobox",
        {
          ...attrs,
          autocomplete: props.autocomplete || undefined,
          disabled: props.disabled || undefined,
          name: props.name || undefined,
          placeholder: props.placeholder || undefined,
          readonly: props.readonly || undefined,
          required: props.required || undefined,
          value: props.modelValue,
          onInput: handleInput,
          onChange: handleChange
        },
        slots.default?.()
      );
  }
});

export const EmbDateInput = defineComponent({
  name: "EmbDateInput",
  props: {
    disabled: { type: Boolean, default: false },
    max: { type: String, default: "" },
    min: { type: String, default: "" },
    modelValue: { type: String, default: "" },
    name: { type: String, default: "" },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "input", "change"],
  setup(props, { attrs, emit }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("change", event);
    };

    return () =>
      h("emb-date-input", {
        ...attrs,
        disabled: props.disabled || undefined,
        max: props.max || undefined,
        min: props.min || undefined,
        name: props.name || undefined,
        readonly: props.readonly || undefined,
        required: props.required || undefined,
        value: props.modelValue,
        onInput: handleInput,
        onChange: handleChange
      });
  }
});

export const EmbTimeInput = defineComponent({
  name: "EmbTimeInput",
  props: {
    disabled: { type: Boolean, default: false },
    max: { type: String, default: "" },
    min: { type: String, default: "" },
    modelValue: { type: String, default: "" },
    name: { type: String, default: "" },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    step: { type: String, default: "" }
  },
  emits: ["update:modelValue", "input", "change"],
  setup(props, { attrs, emit }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("change", event);
    };

    return () =>
      h("emb-time-input", {
        ...attrs,
        disabled: props.disabled || undefined,
        max: props.max || undefined,
        min: props.min || undefined,
        name: props.name || undefined,
        readonly: props.readonly || undefined,
        required: props.required || undefined,
        step: props.step || undefined,
        value: props.modelValue,
        onInput: handleInput,
        onChange: handleChange
      });
  }
});

export const EmbToast = defineComponent({
  name: "EmbToast",
  props: {
    dismissible: { type: Boolean, default: false },
    open: { type: Boolean, default: true },
    tone: { type: String as PropType<"neutral" | "success" | "warning" | "danger">, default: "neutral" }
  },
  emits: ["update:open", "close"],
  setup(props, { attrs, emit, slots }) {
    const handleClose = (event: Event) => {
      emit("update:open", false);
      emit("close", event);
    };

    return () =>
      h(
        "emb-toast",
        {
          ...attrs,
          dismissible: props.dismissible || undefined,
          open: props.open || undefined,
          tone: props.tone,
          onClose: handleClose
        },
        slots.default?.()
      );
  }
});

export const EmbToastRegion = defineComponent({
  name: "EmbToastRegion",
  props: {
    maxVisible: { type: Number, default: 5 },
    placement: { type: String as PropType<ToastPlacement>, default: "top-end" }
  },
  emits: ["toast-show", "toast-remove"],
  setup(props, { attrs, emit, slots }) {
    const handleToastShow = (event: Event) => {
      emit("toast-show", event);
    };

    const handleToastRemove = (event: Event) => {
      emit("toast-remove", event);
    };

    return () =>
      h(
        "emb-toast-region",
        {
          ...attrs,
          maxVisible: props.maxVisible,
          placement: props.placement,
          onToastShow: handleToastShow,
          onToastRemove: handleToastRemove
        },
        slots
      );
  }
});

export const EmbTooltip = defineComponent({
  name: "EmbTooltip",
  props: {
    open: { type: Boolean, default: false },
    text: { type: String, default: "" }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "emb-tooltip",
        {
          ...attrs,
          open: props.open || undefined,
          text: props.text || undefined
        },
        slots.default?.()
      );
  }
});

export const EmbPopover = defineComponent({
  name: "EmbPopover",
  props: {
    open: { type: Boolean, default: false }
  },
  emits: ["update:open", "toggle"],
  setup(props, { attrs, emit, slots }) {
    const handleToggle = (event: Event) => {
      const target = event.currentTarget as OpenHost;
      emit("update:open", target.open);
      emit("toggle", event);
    };

    return () =>
      h(
        "emb-popover",
        {
          ...attrs,
          open: props.open || undefined,
          onToggle: handleToggle
        },
        slots.default?.()
      );
  }
});

export const EmbDropdownMenu = defineComponent({
  name: "EmbDropdownMenu",
  props: {
    open: { type: Boolean, default: false }
  },
  emits: ["update:open", "toggle"],
  setup(props, { attrs, emit, slots }) {
    const handleToggle = (event: Event) => {
      const target = event.currentTarget as OpenHost;
      emit("update:open", target.open);
      emit("toggle", event);
    };

    return () =>
      h(
        "emb-dropdown-menu",
        {
          ...attrs,
          open: props.open || undefined,
          onToggle: handleToggle
        },
        slots.default?.()
      );
  }
});

export const EmbDrawer = defineComponent({
  name: "EmbDrawer",
  props: {
    open: { type: Boolean, default: false },
    side: { type: String as PropType<"start" | "end">, default: "end" }
  },
  emits: ["update:open", "close"],
  setup(props, { attrs, emit, slots }) {
    const handleClose = (event: Event) => {
      emit("update:open", false);
      emit("close", event);
    };

    return () =>
      h(
        "emb-drawer",
        {
          ...attrs,
          open: props.open || undefined,
          side: props.side,
          onClose: handleClose
        },
        slots.default?.()
      );
  }
});

export const EmbInput = defineComponent({
  name: "EmbInput",
  props: {
    autocomplete: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
    modelValue: { type: String, default: "" },
    name: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    type: { type: String, default: "text" }
  },
  emits: ["update:modelValue", "input", "change"],
  setup(props, { attrs, emit }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("change", event);
    };

    return () =>
      h("emb-input", {
        ...attrs,
        autocomplete: props.autocomplete,
        disabled: props.disabled || undefined,
        name: props.name || undefined,
        placeholder: props.placeholder || undefined,
        readonly: props.readonly || undefined,
        required: props.required || undefined,
        type: props.type,
        value: props.modelValue,
        onInput: handleInput,
        onChange: handleChange
      });
  }
});

export const EmbEmailInput = defineComponent({
  name: "EmbEmailInput",
  props: {
    autocomplete: { type: String, default: "email" },
    disabled: { type: Boolean, default: false },
    modelValue: { type: String, default: "" },
    name: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "input", "change"],
  setup(props, { attrs, emit }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("change", event);
    };

    return () =>
      h("emb-email-input", {
        ...attrs,
        autocomplete: props.autocomplete,
        disabled: props.disabled || undefined,
        name: props.name || undefined,
        placeholder: props.placeholder || undefined,
        readonly: props.readonly || undefined,
        required: props.required || undefined,
        value: props.modelValue,
        onInput: handleInput,
        onChange: handleChange
      });
  }
});

export const EmbPasswordInput = defineComponent({
  name: "EmbPasswordInput",
  props: {
    autocomplete: { type: String, default: "current-password" },
    disabled: { type: Boolean, default: false },
    modelValue: { type: String, default: "" },
    name: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "input", "change"],
  setup(props, { attrs, emit }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("change", event);
    };

    return () =>
      h("emb-password-input", {
        ...attrs,
        autocomplete: props.autocomplete,
        disabled: props.disabled || undefined,
        name: props.name || undefined,
        placeholder: props.placeholder || undefined,
        readonly: props.readonly || undefined,
        required: props.required || undefined,
        value: props.modelValue,
        onInput: handleInput,
        onChange: handleChange
      });
  }
});

export const EmbTelInput = defineComponent({
  name: "EmbTelInput",
  props: {
    autocomplete: { type: String, default: "tel" },
    disabled: { type: Boolean, default: false },
    modelValue: { type: String, default: "" },
    name: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "input", "change"],
  setup(props, { attrs, emit }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("change", event);
    };

    return () =>
      h("emb-tel-input", {
        ...attrs,
        autocomplete: props.autocomplete,
        disabled: props.disabled || undefined,
        name: props.name || undefined,
        placeholder: props.placeholder || undefined,
        readonly: props.readonly || undefined,
        required: props.required || undefined,
        value: props.modelValue,
        onInput: handleInput,
        onChange: handleChange
      });
  }
});

export const EmbUrlInput = defineComponent({
  name: "EmbUrlInput",
  props: {
    autocomplete: { type: String, default: "url" },
    disabled: { type: Boolean, default: false },
    modelValue: { type: String, default: "" },
    name: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "input", "change"],
  setup(props, { attrs, emit }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("change", event);
    };

    return () =>
      h("emb-url-input", {
        ...attrs,
        autocomplete: props.autocomplete,
        disabled: props.disabled || undefined,
        name: props.name || undefined,
        placeholder: props.placeholder || undefined,
        readonly: props.readonly || undefined,
        required: props.required || undefined,
        value: props.modelValue,
        onInput: handleInput,
        onChange: handleChange
      });
  }
});

export const EmbColorInput = defineComponent({
  name: "EmbColorInput",
  props: {
    disabled: { type: Boolean, default: false },
    modelValue: { type: String, default: "#4f46e5" },
    name: { type: String, default: "" }
  },
  emits: ["update:modelValue", "input", "change"],
  setup(props, { attrs, emit }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("change", event);
    };

    return () =>
      h("emb-color-input", {
        ...attrs,
        disabled: props.disabled || undefined,
        name: props.name || undefined,
        value: props.modelValue,
        onInput: handleInput,
        onChange: handleChange
      });
  }
});

export const EmbCheckbox = defineComponent({
  name: "EmbCheckbox",
  props: {
    disabled: { type: Boolean, default: false },
    modelValue: { type: Boolean, default: false },
    name: { type: String, default: "" },
    required: { type: Boolean, default: false },
    value: { type: String, default: "on" }
  },
  emits: ["update:modelValue", "input", "change"],
  setup(props, { attrs, emit, slots }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as CheckboxHost;
      emit("update:modelValue", target.checked);
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as CheckboxHost;
      emit("update:modelValue", target.checked);
      emit("change", event);
    };

    return () =>
      h(
        "emb-checkbox",
        {
          ...attrs,
          checked: props.modelValue || undefined,
          disabled: props.disabled || undefined,
          name: props.name || undefined,
          required: props.required || undefined,
          value: props.value,
          onInput: handleInput,
          onChange: handleChange
        },
        slots.default?.()
      );
  }
});

export const EmbSelect = defineComponent({
  name: "EmbSelect",
  props: {
    disabled: { type: Boolean, default: false },
    modelValue: { type: String, default: "" },
    name: { type: String, default: "" },
    required: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "input", "change"],
  setup(props, { attrs, emit, slots }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as SelectHost;
      emit("update:modelValue", target.value);
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as SelectHost;
      emit("update:modelValue", target.value);
      emit("change", event);
    };

    return () =>
      h(
        "emb-select",
        {
          ...attrs,
          disabled: props.disabled || undefined,
          name: props.name || undefined,
          required: props.required || undefined,
          value: props.modelValue,
          onInput: handleInput,
          onChange: handleChange
        },
        slots.default?.()
      );
  }
});

export const EmbRadio = defineComponent({
  name: "EmbRadio",
  props: {
    checked: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    name: { type: String, default: "" },
    required: { type: Boolean, default: false },
    value: { type: String, default: "on" }
  },
  emits: ["update:checked", "input", "change"],
  setup(props, { attrs, emit, slots }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as CheckboxHost;
      emit("update:checked", target.checked);
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as CheckboxHost;
      emit("update:checked", target.checked);
      emit("change", event);
    };

    return () =>
      h(
        "emb-radio",
        {
          ...attrs,
          checked: props.checked || undefined,
          disabled: props.disabled || undefined,
          name: props.name || undefined,
          required: props.required || undefined,
          value: props.value,
          onInput: handleInput,
          onChange: handleChange
        },
        slots.default?.()
      );
  }
});

export const EmbDialog = defineComponent({
  name: "EmbDialog",
  props: {
    modal: { type: Boolean, default: true },
    open: { type: Boolean, default: false }
  },
  emits: ["update:open", "close", "cancel"],
  setup(props, { attrs, emit, slots }) {
    const handleClose = (event: Event) => {
      emit("update:open", false);
      emit("close", event);
    };

    const handleCancel = (event: Event) => {
      emit("update:open", false);
      emit("cancel", event);
    };

    return () =>
      h(
        "emb-dialog",
        {
          ...attrs,
          modal: props.modal || undefined,
          open: props.open || undefined,
          onClose: handleClose,
          onCancel: handleCancel
        },
        slots.default?.()
      );
  }
});

export const EmbTextarea = defineComponent({
  name: "EmbTextarea",
  props: {
    disabled: { type: Boolean, default: false },
    modelValue: { type: String, default: "" },
    name: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    rows: { type: Number, default: 4 }
  },
  emits: ["update:modelValue", "input", "change"],
  setup(props, { attrs, emit }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as InputHost;
      emit("update:modelValue", target.value);
      emit("change", event);
    };

    return () =>
      h("emb-textarea", {
        ...attrs,
        disabled: props.disabled || undefined,
        name: props.name || undefined,
        placeholder: props.placeholder || undefined,
        readonly: props.readonly || undefined,
        required: props.required || undefined,
        rows: props.rows,
        value: props.modelValue,
        onInput: handleInput,
        onChange: handleChange
      });
  }
});

export const EmbSwitch = defineComponent({
  name: "EmbSwitch",
  props: {
    disabled: { type: Boolean, default: false },
    modelValue: { type: Boolean, default: false },
    name: { type: String, default: "" },
    required: { type: Boolean, default: false },
    value: { type: String, default: "on" }
  },
  emits: ["update:modelValue", "input", "change"],
  setup(props, { attrs, emit, slots }) {
    const handleInput = (event: Event) => {
      const target = event.currentTarget as CheckboxHost;
      emit("update:modelValue", target.checked);
      emit("input", event);
    };

    const handleChange = (event: Event) => {
      const target = event.currentTarget as CheckboxHost;
      emit("update:modelValue", target.checked);
      emit("change", event);
    };

    return () =>
      h(
        "emb-switch",
        {
          ...attrs,
          checked: props.modelValue || undefined,
          disabled: props.disabled || undefined,
          name: props.name || undefined,
          required: props.required || undefined,
          value: props.value,
          onInput: handleInput,
          onChange: handleChange
        },
        slots.default?.()
      );
  }
});

export const EmbTabs = defineComponent({
  name: "EmbTabs",
  props: {
    value: { type: String, default: "" }
  },
  emits: ["update:value", "change"],
  setup(props, { attrs, emit, slots }) {
    const handleChange = (event: Event) => {
      const target = event.currentTarget as SelectHost;
      emit("update:value", target.value);
      emit("change", event);
    };

    return () =>
      h(
        "emb-tabs",
        {
          ...attrs,
          value: props.value || undefined,
          onChange: handleChange
        },
        slots.default?.()
      );
  }
});

export const EmbAccordion = defineComponent({
  name: "EmbAccordion",
  props: {
    open: { type: Boolean, default: false }
  },
  emits: ["update:open", "toggle"],
  setup(props, { attrs, emit, slots }) {
    const handleToggle = (event: Event) => {
      const target = event.currentTarget as HTMLElement & { open: boolean };
      emit("update:open", target.open);
      emit("toggle", event);
    };

    return () =>
      h(
        "emb-accordion",
        {
          ...attrs,
          open: props.open || undefined,
          onToggle: handleToggle
        },
        slots.default?.()
      );
  }
});
