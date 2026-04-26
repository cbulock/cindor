import type { ToastTone } from "./emb-toast.js";
import type { EmbToastRegion } from "./emb-toast-region.js";

export type ToastContent = Node | string;
export type ToastPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end";

export type ShowToastOptions = {
  content: ToastContent;
  dismissible?: boolean;
  duration?: number;
  id?: string;
  tone?: ToastTone;
};

const DEFAULT_REGION_ID = "emberline-toast-region";

export function clearToasts(region: EmbToastRegion = ensureToastRegion()): void {
  region.clear();
}

export function dismissToast(id: string, region: EmbToastRegion = ensureToastRegion()): boolean {
  return region.dismissToast(id);
}

export function ensureToastRegion(root: Document = document): EmbToastRegion {
  let region = root.getElementById(DEFAULT_REGION_ID) as EmbToastRegion | null;

  if (region) {
    return region;
  }

  region = root.createElement("emb-toast-region") as EmbToastRegion;
  region.id = DEFAULT_REGION_ID;
  root.body.append(region);

  return region;
}

export function showToast(options: ShowToastOptions, region: EmbToastRegion = ensureToastRegion()): string {
  return region.showToast(options);
}
