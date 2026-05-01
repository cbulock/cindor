export function findCurrentIndexFromPath(path: EventTarget[], items: readonly HTMLElement[]): number {
  return items.findIndex((item) => path.includes(item) || item.shadowRoot?.activeElement !== null);
}

type HandleLinearKeyboardNavigationOptions<T> = {
  currentIndex: number;
  event: KeyboardEvent;
  homeKey?: string;
  items: readonly T[];
  nextKeys: readonly string[];
  onNavigate: (item: T, index: number) => void;
  previousKeys: readonly string[];
};

export function handleLinearKeyboardNavigation<T>({
  currentIndex,
  event,
  homeKey = "Home",
  items,
  nextKeys,
  onNavigate,
  previousKeys
}: HandleLinearKeyboardNavigationOptions<T>): boolean {
  if (items.length === 0 || currentIndex === -1) {
    return false;
  }

  let nextIndex: number | null = null;

  if (nextKeys.includes(event.key)) {
    nextIndex = (currentIndex + 1) % items.length;
  } else if (previousKeys.includes(event.key)) {
    nextIndex = (currentIndex - 1 + items.length) % items.length;
  } else if (event.key === homeKey) {
    nextIndex = 0;
  } else if (event.key === "End") {
    nextIndex = items.length - 1;
  }

  if (nextIndex === null) {
    return false;
  }

  const nextItem = items[nextIndex];
  if (nextItem === undefined) {
    return false;
  }

  event.preventDefault();
  onNavigate(nextItem, nextIndex);
  return true;
}

export function getNextEnabledIndex<T>(
  items: readonly T[],
  currentIndex: number,
  direction: 1 | -1,
  isDisabled: (item: T) => boolean
): number {
  if (items.length === 0 || items.every((item) => isDisabled(item))) {
    return -1;
  }

  let index = currentIndex;

  for (let step = 0; step < items.length; step += 1) {
    index = index < 0 ? (direction === 1 ? 0 : items.length - 1) : (index + direction + items.length) % items.length;

    const item = items[index];
    if (item !== undefined && !isDisabled(item)) {
      return index;
    }
  }

  return -1;
}
