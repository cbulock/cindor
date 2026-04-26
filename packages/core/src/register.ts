import { EmbAccordion } from "./components/accordion/emb-accordion.js";
import { EmbAlert } from "./components/alert/emb-alert.js";
import { EmbAvatar } from "./components/avatar/emb-avatar.js";
import { EmbBadge } from "./components/badge/emb-badge.js";
import { EmbBreadcrumbs } from "./components/breadcrumbs/emb-breadcrumbs.js";
import { EmbButton } from "./components/button/emb-button.js";
import { EmbCard } from "./components/card/emb-card.js";
import { EmbCheckbox } from "./components/checkbox/emb-checkbox.js";
import { EmbCodeBlock } from "./components/code-block/emb-code-block.js";
import { EmbColorInput } from "./components/color-input/emb-color-input.js";
import { EmbCombobox } from "./components/combobox/emb-combobox.js";
import { EmbDateInput } from "./components/date-input/emb-date-input.js";
import { EmbEmailInput } from "./components/email-input/emb-email-input.js";
import { EmbDivider } from "./components/divider/emb-divider.js";
import { EmbDialog } from "./components/dialog/emb-dialog.js";
import { EmbDrawer } from "./components/drawer/emb-drawer.js";
import { EmbDropdownMenu } from "./components/dropdown-menu/emb-dropdown-menu.js";
import { EmbEmptyState } from "./components/empty-state/emb-empty-state.js";
import { EmbFieldset } from "./components/fieldset/emb-fieldset.js";
import { EmbFileInput } from "./components/file-input/emb-file-input.js";
import { EmbIcon } from "./components/icon/emb-icon.js";
import { EmbInput } from "./components/input/emb-input.js";
import { EmbLink } from "./components/link/emb-link.js";
import { EmbMeter } from "./components/meter/emb-meter.js";
import { EmbNumberInput } from "./components/number-input/emb-number-input.js";
import { EmbPagination } from "./components/pagination/emb-pagination.js";
import { EmbPasswordInput } from "./components/password-input/emb-password-input.js";
import { EmbPopover } from "./components/popover/emb-popover.js";
import { EmbProgress } from "./components/progress/emb-progress.js";
import { EmbRange } from "./components/range/emb-range.js";
import { EmbRadio } from "./components/radio/emb-radio.js";
import { EmbSearch } from "./components/search/emb-search.js";
import { EmbSkeleton } from "./components/skeleton/emb-skeleton.js";
import { EmbSelect } from "./components/select/emb-select.js";
import { EmbSpinner } from "./components/spinner/emb-spinner.js";
import { EmbSwitch } from "./components/switch/emb-switch.js";
import { EmbTabs } from "./components/tabs/emb-tabs.js";
import { EmbTelInput } from "./components/tel-input/emb-tel-input.js";
import { EmbTextarea } from "./components/textarea/emb-textarea.js";
import { EmbTimeInput } from "./components/time-input/emb-time-input.js";
import { EmbToast } from "./components/toast/emb-toast.js";
import { EmbToastRegion } from "./components/toast/emb-toast-region.js";
import { EmbTooltip } from "./components/tooltip/emb-tooltip.js";
import { EmbUrlInput } from "./components/url-input/emb-url-input.js";

const definitions = [
  ["emb-alert", EmbAlert],
  ["emb-toast", EmbToast],
  ["emb-toast-region", EmbToastRegion],
  ["emb-tooltip", EmbTooltip],
  ["emb-popover", EmbPopover],
  ["emb-dropdown-menu", EmbDropdownMenu],
  ["emb-drawer", EmbDrawer],
  ["emb-avatar", EmbAvatar],
  ["emb-progress", EmbProgress],
  ["emb-meter", EmbMeter],
  ["emb-breadcrumbs", EmbBreadcrumbs],
  ["emb-skeleton", EmbSkeleton],
  ["emb-link", EmbLink],
  ["emb-fieldset", EmbFieldset],
  ["emb-range", EmbRange],
  ["emb-file-input", EmbFileInput],
  ["emb-icon", EmbIcon],
  ["emb-pagination", EmbPagination],
  ["emb-empty-state", EmbEmptyState],
  ["emb-code-block", EmbCodeBlock],
  ["emb-color-input", EmbColorInput],
  ["emb-number-input", EmbNumberInput],
  ["emb-search", EmbSearch],
  ["emb-combobox", EmbCombobox],
  ["emb-date-input", EmbDateInput],
  ["emb-email-input", EmbEmailInput],
  ["emb-password-input", EmbPasswordInput],
  ["emb-tel-input", EmbTelInput],
  ["emb-time-input", EmbTimeInput],
  ["emb-url-input", EmbUrlInput],
  ["emb-card", EmbCard],
  ["emb-badge", EmbBadge],
  ["emb-divider", EmbDivider],
  ["emb-spinner", EmbSpinner],
  ["emb-button", EmbButton],
  ["emb-input", EmbInput],
  ["emb-checkbox", EmbCheckbox],
  ["emb-select", EmbSelect],
  ["emb-radio", EmbRadio],
  ["emb-dialog", EmbDialog],
  ["emb-textarea", EmbTextarea],
  ["emb-switch", EmbSwitch],
  ["emb-tabs", EmbTabs],
  ["emb-accordion", EmbAccordion]
] as const;

export function registerEmberlineUi(): void {
  for (const [tagName, elementClass] of definitions) {
    if (!customElements.get(tagName)) {
      customElements.define(tagName, elementClass);
    }
  }
}

registerEmberlineUi();
