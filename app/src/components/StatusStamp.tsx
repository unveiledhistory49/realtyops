"use client";

import { useMemo, useEffect, useRef } from "react";

interface StatusStampProps {
  status: string;
  recordId: string;
  className?: string;
}

/**
 * Deterministic hash → rotation between -2° and +2°.
 * Same recordId always produces the same angle,
 * so repeated stamps don't look mechanically identical.
 */
function hashToRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Map to range [-2, 2] with one decimal
  return Math.round(((Math.abs(hash) % 41) / 10 - 2) * 10) / 10;
}

/**
 * Status → color mapping:
 * - active, new        → Ink text + Ink border
 * - pending, contacted,
 *   showing, offer,
 *   confirmed          → Ink text + Manila border
 * - closed, completed  → Ledger Green
 * - lost, cancelled    → Stamp Red
 */
function getStampClasses(status: string): string {
  const s = status.toLowerCase();
  if (["closed", "completed"].includes(s)) {
    return "border-ledger-green text-ledger-green";
  }
  if (["lost", "cancelled"].includes(s)) {
    return "border-stamp-red text-stamp-red";
  }
  if (["pending", "contacted", "showing", "offer", "confirmed"].includes(s)) {
    return "border-manila text-ink";
  }
  // active, new, or anything else
  return "border-ink text-ink";
}

export function StatusStamp({
  status,
  recordId,
  className = "",
}: StatusStampProps) {
  const rotation = useMemo(() => hashToRotation(recordId), [recordId]);
  const prevStatusRef = useRef(status);
  const stampRef = useRef<HTMLSpanElement>(null);

  /* Trigger stamp-in animation on status change */
  useEffect(() => {
    if (prevStatusRef.current !== status && stampRef.current) {
      const el = stampRef.current;
      el.classList.remove("stamp-animate");
      // Force reflow to restart animation
      void el.offsetWidth;
      el.classList.add("stamp-animate");
    }
    prevStatusRef.current = status;
  }, [status]);

  return (
    <span
      ref={stampRef}
      className={`
        inline-block px-2 py-0.5
        border
        font-stamp
        bg-transparent
        stamp-animate
        ${getStampClasses(status)}
        ${className}
      `}
      style={
        {
          "--stamp-rotate": `${rotation}deg`,
          transform: `rotate(${rotation}deg)`,
        } as React.CSSProperties
      }
    >
      {status.toUpperCase()}
    </span>
  );
}
