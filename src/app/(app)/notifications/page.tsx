"use client";

import { AlertTriangle, Bell, CheckCheck, CheckCircle2, ClipboardCheck, Info } from "lucide-react";
import { EmptyState, PageHeader, btn, cn } from "@/components/ui";
import { useApp } from "@/lib/store";
import { timeAgo } from "@/lib/data";

const ICONS: Record<string, { icon: typeof Info; cls: string }> = {
  success: { icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600" },
  warning: { icon: AlertTriangle, cls: "bg-amber-50 text-amber-600" },
  review: { icon: ClipboardCheck, cls: "bg-navy-50 text-navy-600" },
  info: { icon: Info, cls: "bg-blue-50 text-blue-600" },
};

export default function NotificationsPage() {
  const { data, markRead } = useApp();
  const unread = data.notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread notification${unread === 1 ? "" : "s"}` : "You're all caught up."}
        actions={
          unread > 0 && (
            <button onClick={() => markRead({ all: true })} className={btn.secondary}>
              <CheckCheck className="h-4 w-4" aria-hidden /> Mark all as read
            </button>
          )
        }
      />

      {data.notifications.length === 0 ? (
        <EmptyState title="No notifications" body="Workflow updates — submissions, reviews and approvals — will appear here." />
      ) : (
        <ul className="space-y-2.5">
          {data.notifications.map((n, i) => {
            const meta = ICONS[n.kind] ?? ICONS.info;
            return (
              <li key={n.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <button
                  onClick={() => !n.read && markRead({ id: n.id })}
                  className={cn(
                    "flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition",
                    n.read ? "border-slate-100 bg-white" : "border-navy-100 bg-navy-50/50 hover:bg-navy-50"
                  )}
                >
                  <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", meta.cls)} aria-hidden>
                    <meta.icon className="h-4.5 w-4.5 h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={cn("text-sm", n.read ? "font-semibold text-slate-700" : "font-bold text-navy-900")}>{n.title}</span>
                      {!n.read && (
                        <span className="flex items-center gap-1 rounded-full bg-navy-900 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
                          New
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-500">{n.body}</span>
                    <span className="mt-1.5 block text-[11px] font-medium text-slate-400">{timeAgo(n.createdAt)}</span>
                  </span>
                  {!n.read && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-navy-600" aria-label="Unread" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <Bell className="h-4 w-4" aria-hidden /> Notifications are role-specific — switch demo roles to see each perspective.
      </p>
    </div>
  );
}
