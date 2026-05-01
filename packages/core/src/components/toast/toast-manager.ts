import type { ToastTone } from "./cindor-toast.js";
import type { CindorToastRegion } from "./cindor-toast-region.js";

export type ToastContent = Node | string;
export type ToastPlacement = "top-start" | "top-end" | "bottom-start" | "bottom-end";

export type ShowToastOptions = {
  content: ToastContent;
  dismissible?: boolean;
  duration?: number;
  id?: string;
  tone?: ToastTone;
};

const DEFAULT_REGION_ID = "cindor-toast-region";

export function clearToasts(region: CindorToastRegion = ensureToastRegion()): void {
  region.clear();
}

export function dismissToast(id: string, region: CindorToastRegion = ensureToastRegion()): boolean {
  return region.dismissToast(id);
}

export function ensureToastRegion(root: Document = document): CindorToastRegion {
  let region = root.getElementById(DEFAULT_REGION_ID) as CindorToastRegion | null;

  if (region) {
    return region;
  }

  region = root.createElement("cindor-toast-region") as CindorToastRegion;
  region.id = DEFAULT_REGION_ID;
  root.body.append(region);

  return region;
}

export function showToast(options: ShowToastOptions, region: CindorToastRegion = ensureToastRegion()): string {
  return region.showToast(options);
}
