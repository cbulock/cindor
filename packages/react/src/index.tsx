import * as React from "react";
import { createComponent } from "@lit/react";

import {
  EmbAccordion as EmbAccordionElement,
  EmbAlert as EmbAlertElement,
  EmbAvatar as EmbAvatarElement,
  EmbBadge as EmbBadgeElement,
  EmbBreadcrumbs as EmbBreadcrumbsElement,
  EmbButton as EmbButtonElement,
  EmbCard as EmbCardElement,
  EmbCheckbox as EmbCheckboxElement,
  EmbCodeBlock as EmbCodeBlockElement,
  EmbColorInput as EmbColorInputElement,
  EmbCombobox as EmbComboboxElement,
  EmbDateInput as EmbDateInputElement,
  EmbDivider as EmbDividerElement,
  EmbDialog as EmbDialogElement,
  EmbDrawer as EmbDrawerElement,
  EmbDropdownMenu as EmbDropdownMenuElement,
  EmbEmailInput as EmbEmailInputElement,
  EmbEmptyState as EmbEmptyStateElement,
  EmbFieldset as EmbFieldsetElement,
  EmbFileInput as EmbFileInputElement,
  EmbIcon as EmbIconElement,
  EmbInput as EmbInputElement,
  EmbLink as EmbLinkElement,
  EmbMeter as EmbMeterElement,
  EmbNumberInput as EmbNumberInputElement,
  EmbPagination as EmbPaginationElement,
  EmbPasswordInput as EmbPasswordInputElement,
  EmbPopover as EmbPopoverElement,
  EmbProgress as EmbProgressElement,
  EmbRadio as EmbRadioElement,
  EmbRange as EmbRangeElement,
  EmbSearch as EmbSearchElement,
  EmbSkeleton as EmbSkeletonElement,
  EmbSelect as EmbSelectElement,
  EmbSpinner as EmbSpinnerElement,
  EmbSwitch as EmbSwitchElement,
  EmbTabs as EmbTabsElement,
  EmbTelInput as EmbTelInputElement,
  EmbTextarea as EmbTextareaElement,
  EmbTimeInput as EmbTimeInputElement,
  EmbToast as EmbToastElement,
  EmbToastRegion as EmbToastRegionElement,
  EmbTooltip as EmbTooltipElement,
  EmbUrlInput as EmbUrlInputElement
} from "emberline-ui-core";
export { clearToasts, dismissToast, ensureToastRegion, showToast } from "emberline-ui-core";
import "emberline-ui-core/register";

export const EmbButton = createComponent({
  react: React,
  tagName: "emb-button",
  elementClass: EmbButtonElement
});

export const EmbCard = createComponent({
  react: React,
  tagName: "emb-card",
  elementClass: EmbCardElement
});

export const EmbBadge = createComponent({
  react: React,
  tagName: "emb-badge",
  elementClass: EmbBadgeElement
});

export const EmbDivider = createComponent({
  react: React,
  tagName: "emb-divider",
  elementClass: EmbDividerElement
});

export const EmbSpinner = createComponent({
  react: React,
  tagName: "emb-spinner",
  elementClass: EmbSpinnerElement
});

export const EmbAlert = createComponent({
  react: React,
  tagName: "emb-alert",
  elementClass: EmbAlertElement
});

export const EmbAvatar = createComponent({
  react: React,
  tagName: "emb-avatar",
  elementClass: EmbAvatarElement
});

export const EmbProgress = createComponent({
  react: React,
  tagName: "emb-progress",
  elementClass: EmbProgressElement
});

export const EmbMeter = createComponent({
  react: React,
  tagName: "emb-meter",
  elementClass: EmbMeterElement
});

export const EmbBreadcrumbs = createComponent({
  react: React,
  tagName: "emb-breadcrumbs",
  elementClass: EmbBreadcrumbsElement
});

export const EmbSkeleton = createComponent({
  react: React,
  tagName: "emb-skeleton",
  elementClass: EmbSkeletonElement
});

export const EmbLink = createComponent({
  react: React,
  tagName: "emb-link",
  elementClass: EmbLinkElement
});

export const EmbFieldset = createComponent({
  react: React,
  tagName: "emb-fieldset",
  elementClass: EmbFieldsetElement
});

export const EmbRange = createComponent({
  react: React,
  tagName: "emb-range",
  elementClass: EmbRangeElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbFileInput = createComponent({
  react: React,
  tagName: "emb-file-input",
  elementClass: EmbFileInputElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbPagination = createComponent({
  react: React,
  tagName: "emb-pagination",
  elementClass: EmbPaginationElement,
  events: {
    onChange: "change"
  }
});

export const EmbEmptyState = createComponent({
  react: React,
  tagName: "emb-empty-state",
  elementClass: EmbEmptyStateElement
});

export const EmbIcon = createComponent({
  react: React,
  tagName: "emb-icon",
  elementClass: EmbIconElement
});

export const EmbCodeBlock = createComponent({
  react: React,
  tagName: "emb-code-block",
  elementClass: EmbCodeBlockElement
});

export const EmbNumberInput = createComponent({
  react: React,
  tagName: "emb-number-input",
  elementClass: EmbNumberInputElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbSearch = createComponent({
  react: React,
  tagName: "emb-search",
  elementClass: EmbSearchElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbCombobox = createComponent({
  react: React,
  tagName: "emb-combobox",
  elementClass: EmbComboboxElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbDateInput = createComponent({
  react: React,
  tagName: "emb-date-input",
  elementClass: EmbDateInputElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbTimeInput = createComponent({
  react: React,
  tagName: "emb-time-input",
  elementClass: EmbTimeInputElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbToast = createComponent({
  react: React,
  tagName: "emb-toast",
  elementClass: EmbToastElement,
  events: {
    onClose: "close"
  }
});

export const EmbToastRegion = createComponent({
  react: React,
  tagName: "emb-toast-region",
  elementClass: EmbToastRegionElement,
  events: {
    onToastRemove: "toast-remove",
    onToastShow: "toast-show"
  }
});

export const EmbTooltip = createComponent({
  react: React,
  tagName: "emb-tooltip",
  elementClass: EmbTooltipElement
});

export const EmbPopover = createComponent({
  react: React,
  tagName: "emb-popover",
  elementClass: EmbPopoverElement,
  events: {
    onToggle: "toggle"
  }
});

export const EmbDropdownMenu = createComponent({
  react: React,
  tagName: "emb-dropdown-menu",
  elementClass: EmbDropdownMenuElement,
  events: {
    onToggle: "toggle"
  }
});

export const EmbDrawer = createComponent({
  react: React,
  tagName: "emb-drawer",
  elementClass: EmbDrawerElement,
  events: {
    onClose: "close"
  }
});

export const EmbInput = createComponent({
  react: React,
  tagName: "emb-input",
  elementClass: EmbInputElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbEmailInput = createComponent({
  react: React,
  tagName: "emb-email-input",
  elementClass: EmbEmailInputElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbPasswordInput = createComponent({
  react: React,
  tagName: "emb-password-input",
  elementClass: EmbPasswordInputElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbTelInput = createComponent({
  react: React,
  tagName: "emb-tel-input",
  elementClass: EmbTelInputElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbUrlInput = createComponent({
  react: React,
  tagName: "emb-url-input",
  elementClass: EmbUrlInputElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbColorInput = createComponent({
  react: React,
  tagName: "emb-color-input",
  elementClass: EmbColorInputElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbCheckbox = createComponent({
  react: React,
  tagName: "emb-checkbox",
  elementClass: EmbCheckboxElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbSelect = createComponent({
  react: React,
  tagName: "emb-select",
  elementClass: EmbSelectElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbRadio = createComponent({
  react: React,
  tagName: "emb-radio",
  elementClass: EmbRadioElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbDialog = createComponent({
  react: React,
  tagName: "emb-dialog",
  elementClass: EmbDialogElement,
  events: {
    onClose: "close",
    onCancel: "cancel"
  }
});

export const EmbTextarea = createComponent({
  react: React,
  tagName: "emb-textarea",
  elementClass: EmbTextareaElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbSwitch = createComponent({
  react: React,
  tagName: "emb-switch",
  elementClass: EmbSwitchElement,
  events: {
    onChange: "change",
    onInput: "input"
  }
});

export const EmbTabs = createComponent({
  react: React,
  tagName: "emb-tabs",
  elementClass: EmbTabsElement,
  events: {
    onChange: "change"
  }
});

export const EmbAccordion = createComponent({
  react: React,
  tagName: "emb-accordion",
  elementClass: EmbAccordionElement,
  events: {
    onToggle: "toggle"
  }
});
