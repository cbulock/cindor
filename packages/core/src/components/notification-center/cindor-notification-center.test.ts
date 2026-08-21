import "../../register.js";

import { CindorNotificationCenter } from "./cindor-notification-center.js";

describe("cindor-notification-center", () => {
  it("renders heading copy, summary counts, and list semantics", async () => {
    const element = document.createElement("cindor-notification-center") as CindorNotificationCenter;
    element.title = "Notifications";
    element.description = "Durable team and product updates.";
    element.totalCount = 12;
    element.unreadCount = 3;
    element.innerHTML = `
      <div slot="meta">Workspace: Platform</div>
      <article>Review request updated</article>
    `;
    document.body.append(element);
    await element.updateComplete;
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="title"]')?.textContent).toContain("Notifications");
    expect(element.renderRoot.querySelector('[part="description"]')?.textContent).toContain("Durable team");
    expect(element.querySelector('[slot="meta"]')?.textContent).toContain("Workspace: Platform");
    expect(element.renderRoot.querySelector('[part="summary"]')?.textContent).toContain("12");
    expect(element.renderRoot.querySelector('[part="summary"]')?.textContent).toContain("Unread");
    expect(element.renderRoot.querySelector('[part="list"]')?.getAttribute("role")).toBe("list");
  });

  it("renders the generated empty state when there are no items", async () => {
    const element = document.createElement("cindor-notification-center") as CindorNotificationCenter;
    element.title = "Notifications";
    document.body.append(element);
    await element.updateComplete;

    expect(element.renderRoot.querySelector('[part="empty-title"]')?.textContent).toContain("No notifications");
    expect(element.renderRoot.querySelector('[part="empty-message"]')?.textContent).toContain("Durable updates will appear here");
    expect(element.renderRoot.querySelector('[part="list"]')).toBeNull();
  });

  it("supports custom empty content and a configurable heading level", async () => {
    const element = document.createElement("cindor-notification-center") as CindorNotificationCenter;
    element.title = "Notifications";
    element.headingLevel = 3;
    element.innerHTML = `<div slot="empty">No pending reviews.</div>`;
    document.body.append(element);
    await element.updateComplete;
    await element.updateComplete;

    expect(element.renderRoot.querySelector("h3.title")?.textContent).toContain("Notifications");
    expect(element.renderRoot.querySelector("h2.title")).toBeNull();
    expect(element.querySelector('[slot="empty"]')?.textContent).toContain("No pending reviews.");
  });
});
