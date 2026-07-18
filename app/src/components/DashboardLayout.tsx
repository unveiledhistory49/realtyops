"use client";

import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: "listings" | "leads";
  onTabChange: (tab: "listings" | "leads") => void;
}

export function DashboardLayout({
  children,
  activeTab,
  onTabChange,
}: DashboardLayoutProps) {
  const tabs: { id: "listings" | "leads"; label: string }[] = [
    { id: "listings", label: "LISTINGS" },
    { id: "leads", label: "LEADS" },
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* ── Top bar ── */}
      <header className="bg-ink">
        <div className="px-6 py-3 flex justify-between items-center">
          <h1 className="font-mono text-lg text-paper uppercase tracking-[0.15em] font-medium">
            REALTYOPS
          </h1>
          <div className="font-mono text-xs text-paper/60 uppercase tracking-wider">
            THE LEDGER
          </div>
        </div>

        {/* ── Filing-tab navigation ── */}
        <nav className="flex px-6 items-end gap-0" aria-label="Main navigation">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  px-6 py-2 font-mono text-xs uppercase tracking-[0.1em]
                  border border-ink border-b-0
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-1 focus-visible:ring-offset-ink
                  transition-colors
                  ${
                    isActive
                      ? "bg-manila text-ink relative top-[1px] pb-[9px] font-medium"
                      : "bg-ink/20 text-paper/60 hover:bg-manila/30 hover:text-paper"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </button>
            );
          })}
          {/* Spacer to fill remaining tab bar with a bottom border */}
          <div className="flex-1 border-b border-ink" />
        </nav>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
