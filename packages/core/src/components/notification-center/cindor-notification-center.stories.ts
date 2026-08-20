type NotificationCenterStoryArgs = {
  empty: boolean;
  title: string;
};

const notificationItems = [
  {
    id: "build-1042",
    title: "Release candidate is ready",
    body: "Build 1042 passed visual checks and is ready for sign-off.",
    meta: "Release pipeline",
    timestamp: "4 minutes ago",
    unread: true,
    badge: "New",
    badgeTone: "accent"
  },
  {
    id: "billing-fix",
    title: "Billing webhook recovered",
    body: "Retries succeeded after the provider latency spike cleared.",
    meta: "Payments",
    timestamp: "42 minutes ago",
    unread: true,
    badge: "Ops",
    badgeTone: "success"
  },
  {
    id: "comment-55",
    title: "Design review left feedback",
    body: "A reviewer asked for tighter spacing around the secondary toolbar.",
    meta: "Component library",
    timestamp: "Yesterday",
    unread: false
  }
];

const meta = {
  title: "Composites/Notification Center",
  args: {
    empty: false,
    title: "Team inbox"
  },
  argTypes: {
    empty: { control: "boolean" },
    title: { control: "text" }
  },
  render: ({ empty, title }: NotificationCenterStoryArgs) => `
    <div style="max-width: 44rem;">
      <cindor-notification-center
        id="storybook-notification-center"
        description="Persistent updates for releases, incidents, and collaborator follow-ups."
        empty-action-label="Configure alerts"
        title="${title}"
      >
        <cindor-button slot="actions" variant="ghost">Preferences</cindor-button>
      </cindor-notification-center>
      <script type="module">
        const center = document.querySelector("#storybook-notification-center");
        const setNotifications = (items) => {
          center.notifications = items;
        };

        setNotifications(${empty ? "[]" : JSON.stringify(notificationItems, null, 2)});

        center.addEventListener("notification-read-change", (event) => {
          const { item, unread } = event.detail;
          setNotifications((center.notifications ?? []).map((entry) => (entry.id === item.id ? { ...entry, unread } : entry)));
        });

        center.addEventListener("notification-dismiss", (event) => {
          const { item } = event.detail;
          setNotifications((center.notifications ?? []).filter((entry) => entry.id !== item.id));
        });

        center.addEventListener("notification-mark-all-read", () => {
          setNotifications((center.notifications ?? []).map((entry) => ({ ...entry, unread: false })));
        });
      </script>
    </div>
  `
};

export default meta;

export const Default = {};
