import { Notification } from "../types";
import { Bell, Check, Circle, ExternalLink, Inbox } from "lucide-react";

interface NotificationsProps {
  notifications: Notification[];
  onMarkAllRead: () => void;
  loading: boolean;
}

export default function Notifications({ notifications, onMarkAllRead, loading }: NotificationsProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-xl mx-auto space-y-4" id="notifications-panel-wrapper">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-850 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Bell className="w-5 h-5 animate-swing" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse border border-gray-900" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold font-display text-white">Inbox Updates</h2>
            <p className="text-[10px] text-gray-500 font-mono">Dynamic auditing and copy yield trackers</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            id="mark-all-read-btn"
            className="px-3 py-1 bg-gray-950 border border-gray-800 hover:border-emerald-500 hover:text-emerald-400 transition-all text-gray-400 rounded-xl font-mono text-[10px] flex items-center gap-1 font-bold group"
          >
            <Check className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-400" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications stack */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">
            <span className="text-xs text-gray-500 font-mono animate-pulse">Checking records data...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-850 rounded-xl" id="empty-notifications-drawer">
            <Inbox className="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <span className="text-xs text-gray-500 font-mono">Your platform inbox is clean.</span>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                n.isRead
                  ? "bg-gray-950/60 border-gray-850/80 text-gray-400"
                  : "bg-gray-950 border-emerald-500/15 text-white"
              }`}
            >
              <div className="mt-1 flex-shrink-0">
                {n.isRead ? (
                  <Check className="w-4 h-4 text-gray-600" />
                ) : (
                  <Circle className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400 mt-0.5 animate-pulse" />
                )}
              </div>

              <div className="grow space-y-1">
                <span className={`text-xs block font-display font-bold ${n.isRead ? "text-gray-300" : "text-emerald-300"}`}>
                  {n.title}
                </span>
                <p className="text-xs font-sans leading-relaxed text-gray-400">
                  {n.message}
                </p>
                <span className="text-[8px] font-mono text-gray-600 block pt-1">
                  {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
