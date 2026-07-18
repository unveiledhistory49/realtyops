"use client";

import React, { useState, useCallback } from "react";

interface RowActionsProps {
  type: "listing" | "lead";
  record: any;
  onAction: (action: string) => void;
}

/* ── Inline SVG icons (16×16, square caps, no icon library) ── */
const icons: Record<string, React.ReactNode> = {
  edit: (
    <path d="M2 14h3l8-8-3-3-8 8v3zM11 3l3 3" />
  ),
  leads: (
    <path d="M8 7a3 3 0 100-6 3 3 0 000 6zM3 15c0-3 3-5 5-5s5 2 5 5" />
  ),
  archive: (
    <path d="M2 4h12M4 4v9h8V4M6 2h4M7 7h2" />
  ),
  contact: (
    <path d="M2 4l6 4 6-4M2 4v8h12V4" />
  ),
  reassign: (
    <path d="M10 3l3 3-3 3M13 6H6M6 13l-3-3 3-3M3 10h7" />
  ),
  showing: (
    <path d="M3 2v12M13 2v12M3 6h10M3 10h4" />
  ),
  close: (
    <path d="M4 4l8 8M12 4L4 12" />
  ),
  view: (
    <path d="M2 8c2-4 5-5 6-5s4 1 6 5c-2 4-5 5-6 5s-4-1-6-5zM8 6a2 2 0 110 4 2 2 0 010-4z" />
  ),
};

const listingActions = [
  { id: "edit", label: "Edit listing" },
  { id: "leads", label: "View leads" },
  { id: "archive", label: "Archive" },
];

const leadActions = [
  { id: "view", label: "View detail" },
  { id: "contact", label: "Mark contacted" },
  { id: "reassign", label: "Reassign agent" },
  { id: "showing", label: "Schedule showing" },
  { id: "close", label: "Close / Lose" },
];

export function RowActions({ type, onAction }: RowActionsProps) {
  const [confirming, setConfirming] = useState<string | null>(null);
  const actions = type === "listing" ? listingActions : leadActions;

  const handleClick = useCallback(
    (e: React.MouseEvent, actionId: string) => {
      e.stopPropagation();
      if (confirming === actionId) {
        onAction(actionId);
        setConfirming(null);
      } else {
        setConfirming(actionId);
        setTimeout(() => setConfirming(null), 3000);
      }
    },
    [confirming, onAction]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, actionId: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        if (confirming === actionId) {
          onAction(actionId);
          setConfirming(null);
        } else {
          setConfirming(actionId);
          setTimeout(() => setConfirming(null), 3000);
        }
      }
    },
    [confirming, onAction]
  );

  return (
    <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150 flex items-center gap-0.5">
      {actions.map((action) => {
        const isConfirming = confirming === action.id;
        return (
          <div key={action.id} className="relative group/action">
            <button
              onClick={(e) => handleClick(e, action.id)}
              onKeyDown={(e) => handleKeyDown(e, action.id)}
              className={`
                p-1.5 border border-transparent
                transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1
                ${
                  isConfirming
                    ? "bg-manila border-ink"
                    : "hover:bg-manila/40 hover:border-hairline"
                }
              `}
              aria-label={isConfirming ? `Confirm: ${action.label}` : action.label}
            >
              {isConfirming ? (
                <span className="font-mono text-[9px] uppercase font-medium tracking-wider text-ink px-0.5">
                  SURE?
                </span>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  className="text-ink/70"
                >
                  {icons[action.id]}
                </svg>
              )}
            </button>

            {/* Tooltip */}
            {!isConfirming && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/action:block whitespace-nowrap bg-ink text-paper font-mono text-[9px] uppercase tracking-wider px-2 py-1 pointer-events-none z-20">
                {action.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
