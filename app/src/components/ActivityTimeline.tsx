"use client";

import React from "react";

interface Activity {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details?: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

function formatTimestamp(ts: string): string {
  const now = Date.now();
  const date = new Date(ts).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="py-6 text-center font-mono text-xs text-ink/40 uppercase tracking-wider">
        No activity recorded
      </div>
    );
  }

  return (
    <div className="divide-y divide-hairline">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="grid grid-cols-[80px_1fr] md:grid-cols-[90px_100px_1fr] gap-3 py-2.5 hover:bg-manila/5 transition-colors"
        >
          <div className="font-tabular text-[11px] text-ink/50 uppercase self-center">
            {formatTimestamp(activity.timestamp)}
          </div>
          <div className="font-mono text-[11px] text-ink uppercase tracking-wider font-medium truncate self-center hidden md:block">
            {activity.actor}
          </div>
          <div className="text-sm text-ink self-center">
            <span className="md:hidden font-mono text-[10px] text-ink/50 uppercase mr-2">
              {activity.actor}:
            </span>
            {activity.action}
            {activity.details && (
              <span className="text-ink/50 ml-1">— {activity.details}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
