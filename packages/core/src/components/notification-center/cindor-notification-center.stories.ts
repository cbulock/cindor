type NotificationCenterStoryArgs = {
  totalCount: number;
  unreadCount: number;
};

const meta = {
  title: "Feedback/Notification Center",
  args: {
    totalCount: 12,
    unreadCount: 3
  },
  argTypes: {
    totalCount: {
      control: { type: "number", min: 0, step: 1 }
    },
    unreadCount: {
      control: { type: "number", min: 0, step: 1 }
    }
  },
  render: ({ totalCount, unreadCount }: NotificationCenterStoryArgs) => `
    <cindor-notification-center
      eyebrow="Activity inbox"
      title="Notifications"
      description="Durable product updates, approvals, and teammate changes that should remain visible until reviewed."
      total-count="${totalCount}"
      unread-count="${unreadCount}"
    >
      <cindor-badge slot="meta" tone="accent">Workspace: Platform</cindor-badge>
      <cindor-button slot="actions" variant="ghost">Mark all read</cindor-button>
      <cindor-button slot="actions">Open inbox settings</cindor-button>
      <div slot="filters">
        <cindor-button variant="ghost">All</cindor-button>
        <cindor-button variant="ghost">Unread</cindor-button>
        <cindor-button variant="ghost">Mentions</cindor-button>
      </div>

      <cindor-activity-item unread>
        <cindor-avatar slot="leading" name="Design Ops"></cindor-avatar>
        <span slot="title">Comment on review request</span>
        <span slot="timestamp">2 minutes ago</span>
        <span slot="meta">@maria • Button refresh</span>
        Updated spacing guidance on the destructive action variant before handoff.
      </cindor-activity-item>

      <cindor-activity-item unread>
        <cindor-avatar slot="leading" name="Build Bot"></cindor-avatar>
        <span slot="title">Deployment blocked</span>
        <span slot="timestamp">12 minutes ago</span>
        <span slot="meta">Production • Release 0.1.85</span>
        Smoke tests failed in checkout flow and require a manual retry before rollout can continue.
      </cindor-activity-item>

      <cindor-activity-item>
        <cindor-avatar slot="leading" name="Support"></cindor-avatar>
        <span slot="title">Customer escalation resolved</span>
        <span slot="timestamp">Yesterday</span>
        <span slot="meta">Priority inbox</span>
        Billing access was restored and the account owner confirmed the fix.
      </cindor-activity-item>

      <div slot="footer">Last synced just now across web, desktop, and mobile.</div>
      <cindor-button slot="footer" variant="ghost">View all activity</cindor-button>
    </cindor-notification-center>
  `
};

export default meta;

export const Default = {};

export const Empty = {
  render: () => `
    <cindor-notification-center
      eyebrow="Review queue"
      title="Notifications"
      description="Nothing is waiting for follow-up right now."
    >
      <cindor-button slot="actions" variant="ghost">Notification settings</cindor-button>
    </cindor-notification-center>
  `
};
