import { html, nothing } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  EyeOff,
  CircleAlert,
  ExternalLink,
  Info,
  Minus,
  Plus,
  Search,
  Upload,
  X,
  type IconNode
} from "lucide";

type SvgAttributeValue = boolean | number | string | undefined;
type IconAttributes = Record<string, SvgAttributeValue>;
type LucideIconNode = IconNode;

export const lucideIcons = {
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  "circle-alert": CircleAlert,
  eye: Eye,
  "eye-off": EyeOff,
  "external-link": ExternalLink,
  info: Info,
  minus: Minus,
  plus: Plus,
  search: Search,
  upload: Upload,
  x: X
} as const satisfies Record<string, LucideIconNode>;

export type LucideIconName = keyof typeof lucideIcons;

export type RenderLucideIconOptions = {
  attributes?: Record<string, SvgAttributeValue>;
  label?: string;
  name: LucideIconName | string;
  size?: number;
  strokeWidth?: number;
};

export function renderLucideIcon({
  attributes = {},
  label = "",
  name,
  size = 24,
  strokeWidth = 2
}: RenderLucideIconOptions) {
  const iconNode = lucideIcons[normalizeIconName(name) as LucideIconName];

  if (!iconNode) {
    return nothing;
  }

  const svgAttributes = {
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": strokeWidth,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    focusable: "false",
    role: label ? "img" : "presentation",
    "aria-hidden": label ? undefined : "true",
    "aria-label": label || undefined,
    ...attributes
  };

  return html`${unsafeSVG(
    `<svg ${serializeAttributes(svgAttributes)}>${iconNode
      .map(([tagName, iconAttributes]) => `<${tagName} ${serializeAttributes(iconAttributes)}></${tagName}>`)
      .join("")}</svg>`
  )}`;
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function normalizeIconName(name: string): string {
  return name
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function serializeAttributes(attributes: IconAttributes): string {
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== false)
    .map(([key, value]) => {
      if (value === true) {
        return key;
      }

      return `${key}="${escapeAttribute(String(value))}"`;
    })
    .join(" ");
}
