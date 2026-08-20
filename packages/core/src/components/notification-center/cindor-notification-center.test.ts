import "../../register.js";

import { CindorNotificationCenter, type NotificationCenterItem } from "./cindor-notification-center.js";

const notifications: NotificationCenterItem[] = [
  {
    id: "deploy-1",
    title: "Deployment approved",
    body: "Staging checks passed and the release is ready for production.",
    meta: "Release pipeline",
    timestamp: "5 minutes ago",
    unread: true
  },
  {
    id: "incident-1",
    title: "Incident resolved",
    body: "Database latency returned to normal after failover.",
    meta: "Operations",
    timestamp: "Yesterday",
    unread: false
  }
];

describe("cindor-notification-center", () => {
  it("renders summary copy and notification rows", async () => {
    const element = document.createElement("cindor-notification-center") as CindorNotificationCenter;
    element.title = "Inbox";
    element.description = "Keep an eye on rollout updates and system alerts.";
    element.notifications = notifications;
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="title"]')?.textContent).toContain("Inbox");
    expect(element.renderRoot.querySelector('[part="description"]')?.textContent).toContain("rollout updates");
    expect(element.renderRoot.querySelectorAll('[part~="item"]')).toHaveLength(2);
    expect(element.renderRoot.querySelector('[part="unread-count"]')?.textContent).toContain("1 unread");
  });

  it("emits selection and read-change events for row interactions", async () => {
    const element = document.createElement("cindor-notification-center") as CindorNotificationCenter;
    element.notifications = notifications;
    const selected = vi.fn();
    const readChanged = vi.fn();
    element.addEventListener("notification-select", selected);
    element.addEventListener("notification-read-change", readChanged);
    document.body.append(element);
    await element.updateComplete;

    const row = element.renderRoot.querySelector('[part~="item"]') as HTMLElement | null;
    row?.click();

    const toggleButton = element.renderRoot.querySelector('[part="toggle-read"]') as HTMLElement | null;
    toggleButton?.click();

    expect(selected).toHaveBeenCalledTimes(1);
    expect(selected.mock.calls[0]?.[0].detail.item.id).toBe("deploy-1");
    expect(readChanged).toHaveBeenCalledTimes(1);
    expect(readChanged.mock.calls[0]?.[0].detail).toMatchObject({
      index: 0,
      unread: false
    });
  });

  it("supports dismiss, mark-all-read, and empty-state actions", async () => {
    const element = document.createElement("cindor-notification-center") as CindorNotificationCenter;
    element.emptyActionLabel = "Configure alerts";
    element.notifications = notifications;
    const dismissed = vi.fn();
    const markedAll = vi.fn();
    element.addEventListener("notification-dismiss", dismissed);
    element.addEventListener("notification-mark-all-read", markedAll);
    document.body.append(element);
    await element.updateComplete;

    const dismissButton = element.renderRoot.querySelector('[part="dismiss"]') as HTMLElement | null;
    dismissButton?.click();

    const markAllButton = element.renderRoot.querySelector('[part="mark-all-read"]') as HTMLElement | null;
    markAllButton?.click();

    expect(dismissed).toHaveBeenCalledTimes(1);
    expect(dismissed.mock.calls[0]?.[0].detail.item.id).toBe("deploy-1");
    expect(markedAll).toHaveBeenCalledTimes(1);
    expect(markedAll.mock.calls[0]?.[0].detail.items).toHaveLength(1);

    element.notifications = [];
    await element.updateComplete;

    const emptyAction = vi.fn();
    element.addEventListener("notification-empty-action", emptyAction);

    const emptyButton = element.renderRoot.querySelector('[part="empty-action"]') as HTMLElement | null;
    emptyButton?.click();

    expect(element.renderRoot.querySelector('[part="empty"]')).not.toBeNull();
    expect(emptyAction).toHaveBeenCalledTimes(1);
  });
});
