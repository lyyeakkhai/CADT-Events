# Dynamic Notifications Implementation Plan

This document details the plan to implement a dynamic notification system in the `frontend-admin` panel, replacing the current static bell icon with a fully interactive popover.

## 1. Feature Requirements
* **Dynamic Fetching**: Fetch notifications from an API or simulate an asynchronous API call (using dummy data for now until the backend is fully wired).
* **Empty State**: If the notification array is empty, display a clear "No notifications" text/icon state instead of a blank dropdown.
* **Unread Indicator**: Show a red dot indicator on the Bell icon *only* if there are unread notifications.
* **UI/UX**: Build a dropdown (Popover) that matches the glassmorphism aesthetic when clicking the Bell icon.

## 2. Component Structure
We will create a new component `NotificationDropdown.tsx` to keep `TopBar.tsx` clean.

### State Management
```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

// Inside the component:
const [notifications, setNotifications] = useState<Notification[]>([]);
const [isOpen, setIsOpen] = useState(false);
const [loading, setLoading] = useState(true);
```

### Data Fetching
We will use a `useEffect` to fetch notifications dynamically on mount:
```typescript
useEffect(() => {
  const fetchNotifications = async () => {
    try {
      // Replace with real axios call later: axios.get('/api/notifications')
      const data = await getDummyNotificationsAsync(); 
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };
  fetchNotifications();
}, []);
```

## 3. UI Rendering Logic
When `isOpen` is true, the popover will render. The internal content will be conditional:

```tsx
<div className="notification-dropdown">
  {loading ? (
    <Spinner />
  ) : notifications.length === 0 ? (
    <div className="empty-state">
      <BellOff size={24} className="text-slate-400" />
      <p>No notifications</p>
    </div>
  ) : (
    <ul className="notification-list">
      {notifications.map(notif => (
        <li key={notif.id} className={notif.read ? 'read' : 'unread'}>
          <h4>{notif.title}</h4>
          <p>{notif.message}</p>
        </li>
      ))}
    </ul>
  )}
</div>
```

## 4. Integration Steps
If approved, I will perform the following steps:
1. Create `src/components/NotificationDropdown.tsx`.
2. Update `TopBar.tsx` (and `Sidebar.tsx` if necessary) to replace the static `<Bell />` with `<NotificationDropdown />`.
3. Add relative positioning and Tailwind utility classes for the popover UI.
4. Implement the "Mark as Read" functionality to interactively update the state.
