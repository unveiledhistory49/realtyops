"use client";

import React, { useState, useCallback } from "react";

interface ShowingSchedulerProps {
  leadId: string;
  listingId: string;
  onSchedule: (date: string, time: string) => void;
}

export function ShowingScheduler({
  onSchedule,
}: ShowingSchedulerProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  const canSchedule = date && time;

  const handleSchedule = useCallback(() => {
    if (!canSchedule) return;

    if (confirming) {
      onSchedule(date, time);
      setConfirming(false);
      setScheduled(true);
      setTimeout(() => {
        setScheduled(false);
        setDate("");
        setTime("");
      }, 2000);
    } else {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    }
  }, [canSchedule, confirming, date, time, onSchedule]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        {/* Date */}
        <div className="flex flex-col gap-1 w-full md:w-auto">
          <label className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
            DATE
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="
              border border-ink bg-transparent px-3 py-1.5
              font-tabular text-sm text-ink
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper
            "
          />
        </div>

        {/* Time */}
        <div className="flex flex-col gap-1 w-full md:w-auto">
          <label className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
            TIME
          </label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="
              border border-ink bg-transparent px-3 py-1.5
              font-tabular text-sm text-ink
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper
              appearance-none
            "
          >
            <option value="">SELECT</option>
            <option value="09:00">09:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="13:00">01:00 PM</option>
            <option value="14:00">02:00 PM</option>
            <option value="15:00">03:00 PM</option>
            <option value="16:00">04:00 PM</option>
            <option value="17:00">05:00 PM</option>
          </select>
        </div>

        {/* Schedule button */}
        <button
          onClick={handleSchedule}
          disabled={!canSchedule}
          className={`
            px-6 py-1.5 font-mono text-xs uppercase tracking-wider
            border border-ink
            transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper
            w-full md:w-auto
            ${
              !canSchedule
                ? "opacity-40 cursor-not-allowed"
                : confirming
                ? "bg-stamp-red text-paper border-stamp-red"
                : scheduled
                ? "bg-ledger-green text-paper border-ledger-green"
                : "bg-manila text-ink hover:bg-ink hover:text-paper"
            }
          `}
        >
          {scheduled ? "SCHEDULED ✓" : confirming ? "CONFIRM?" : "SCHEDULE"}
        </button>
      </div>
    </div>
  );
}
