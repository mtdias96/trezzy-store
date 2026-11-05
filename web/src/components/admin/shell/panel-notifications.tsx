import { BellIcon } from 'lucide-react';

type PanelNotificationsProps = {
  unread?: number;
};

export function PanelNotifications({ unread = 0 }: PanelNotificationsProps) {
  return (
    <button
      type="button"
      aria-label={unread > 0 ? `Notificações: ${unread} não lidas` : 'Notificações'}
      className="relative flex size-11 shrink-0 items-center justify-center rounded-pill border border-gray-250 text-ink transition-colors duration-base hover:bg-gray-100 md:size-10"
    >
      <BellIcon aria-hidden className="size-4.5" />
      {unread > 0
        ? (
            <span
              aria-hidden
              className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-pill bg-brand px-1 text-caption font-bold text-gray-0 ring-2 ring-card"
            >
              {unread}
            </span>
          )
        : null}
    </button>
  );
}
