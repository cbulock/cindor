import { html, nothing } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import type { IconNode } from "lucide";

type SvgAttributeValue = boolean | number | string | undefined;
type IconAttributes = Record<string, SvgAttributeValue>;
type LucideIconNode = IconNode;

const lucideIconCache = new Map<string, LucideIconNode | null>();
const lucideIconRequestCache = new Map<string, Promise<LucideIconNode | null>>();

export type LucideIconName = string;

export type RenderLucideIconOptions = {
  attributes?: Record<string, SvgAttributeValue>;
  iconNode: LucideIconNode | null;
  label?: string;
  size?: number;
  strokeWidth?: number;
};

export function renderLucideIcon({
  attributes = {},
  iconNode,
  label = "",
  size = 24,
  strokeWidth = 2.25
}: RenderLucideIconOptions) {
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
    style: [
      "overflow: visible",
      "transform-box: fill-box",
      "transform-origin: center",
      "stroke-linecap: var(--cindor-lucide-icon-linecap, round)",
      "stroke-linejoin: var(--cindor-lucide-icon-linejoin, round)",
      `stroke-width: var(--cindor-lucide-icon-stroke-width, ${strokeWidth})`,
      "transform: var(--cindor-lucide-icon-transform, none)",
      "filter: var(--cindor-lucide-icon-filter, none)"
    ].join("; "),
    ...attributes
  };

  return html`${unsafeSVG(
    `<svg ${serializeAttributes(svgAttributes)}>${iconNode
      .map(([tagName, iconAttributes]) => `<${tagName} ${serializeAttributes(iconAttributes)}></${tagName}>`)
      .join("")}</svg>`
  )}`;
}

export async function loadLucideIcon(name: LucideIconName | string): Promise<LucideIconNode | null> {
  const normalizedName = normalizeIconName(name);

  if (!normalizedName) {
    return null;
  }

  const cachedIcon = lucideIconCache.get(normalizedName);
  if (cachedIcon !== undefined) {
    return cachedIcon;
  }

  const pendingRequest = lucideIconRequestCache.get(normalizedName);
  if (pendingRequest) {
    return pendingRequest;
  }

  const request = import(`lucide/dist/esm/icons/${normalizedName}.mjs`)
    .then((module) => {
      const iconNode = isLucideIconNode(module.default) ? module.default : null;
      lucideIconCache.set(normalizedName, iconNode);
      lucideIconRequestCache.delete(normalizedName);
      return iconNode;
    })
    .catch(() => {
      lucideIconCache.set(normalizedName, null);
      lucideIconRequestCache.delete(normalizedName);
      return null;
    });

  lucideIconRequestCache.set(normalizedName, request);
  return request;
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function normalizeIconName(name: string): string {
  return name
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function isLucideIconNode(value: unknown): value is LucideIconNode {
  return Array.isArray(value) && value.every(isLucideIconNodeChild);
}

function isLucideIconNodeChild(value: unknown): value is LucideIconNode[number] {
  if (!Array.isArray(value) || value.length !== 2) {
    return false;
  }

  const [tagName, attributes] = value;

  return typeof tagName === "string" && isIconAttributes(attributes);
}

function isIconAttributes(value: unknown): value is IconAttributes {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(
    (attributeValue) =>
      attributeValue === undefined ||
      typeof attributeValue === "boolean" ||
      typeof attributeValue === "number" ||
      typeof attributeValue === "string"
  );
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
