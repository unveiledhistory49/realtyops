"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLead } from "@/lib/api-client";
import { ActivityTimeline } from "./ActivityTimeline";
import { ShowingScheduler } from "./ShowingScheduler";
import { StatusStamp } from "./StatusStamp";

interface LeadDetailDrawerProps {
  leadId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadDetailDrawer({
  leadId,
  isOpen,
  onClose,
}: LeadDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  /* Fetch lead data when drawer is open */
  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => fetchLead(leadId!),
    enabled: !!leadId && isOpen,
  });

  /* Keyboard: Esc to close, focus trap */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      /* Basic focus trap */
      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
      /* Focus the close button when opening */
      requestAnimationFrame(() => closeBtnRef.current?.focus());
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop — dims, no blur */}
      <div
        className="fixed inset-0 bg-ink/40 z-40 transition-opacity motion-reduce:transition-none"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Lead detail"
        className="
          fixed top-0 right-0 bottom-0 w-full md:w-[480px]
          bg-paper z-50 border-l border-ink
          flex flex-col
          drawer-enter
        "
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-3 border-b border-ink bg-ink text-paper">
          <h2 className="font-mono text-xs uppercase tracking-[0.1em]">
            LEAD RECORD
          </h2>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="p-1 hover:bg-paper/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper"
            aria-label="Close drawer"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
            >
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-6 bg-hairline/30 animate-pulse"
                />
              ))}
            </div>
          ) : lead ? (
            <>
              {/* Lead info */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-medium text-ink">
                      {lead.name}
                    </h3>
                    <p className="font-mono text-xs text-ink/60 mt-1">
                      {lead.email} · {lead.phone}
                    </p>
                  </div>
                  <StatusStamp status={lead.status} recordId={lead.id} />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-hairline">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
                      LISTING
                    </div>
                    <div className="font-tabular text-sm text-ink mt-0.5">
                      {lead.listingId || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
                      CREATED
                    </div>
                    <div className="font-tabular text-sm text-ink mt-0.5">
                      {new Date(lead.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
                      AGENT
                    </div>
                    <div className="text-sm text-ink mt-0.5">
                      Agent {lead.assignedAgentId || "Unassigned"}
                    </div>
                  </div>
                  {lead.lostReason && (
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-stamp-red/70">
                        LOST REASON
                      </div>
                      <div className="text-sm text-stamp-red mt-0.5">
                        {lead.lostReason}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity timeline */}
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink/50 mb-3 border-b border-hairline pb-2">
                  ACTIVITY LOG
                </h4>
                <ActivityTimeline
                  activities={lead.activities || []}
                />
              </div>

              {/* Showing scheduler */}
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink/50 mb-3 border-b border-hairline pb-2">
                  SCHEDULE A SHOWING
                </h4>
                <ShowingScheduler
                  leadId={lead.id}
                  listingId={lead.listingId || ""}
                  onSchedule={(date, time) =>
                    console.log("Showing scheduled:", date, time)
                  }
                />
              </div>
            </>
          ) : (
            <p className="font-mono text-sm text-ink/50">
              Lead not found
            </p>
          )}
        </div>
      </div>
    </>
  );
}
