"use client";

import React, { useState } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroupConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  filters: Record<string, string | undefined>;
  onFilterChange: (key: string, value: string | undefined) => void;
  filterConfig: FilterGroupConfig[];
  searchPlaceholder?: string;
}

export function FilterBar({
  filters,
  onFilterChange,
  filterConfig,
  searchPlaceholder = "Search…",
}: FilterBarProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onFilterChange("search", searchValue || undefined);
    }
  };

  const handleSearchClear = () => {
    setSearchValue("");
    onFilterChange("search", undefined);
  };

  return (
    <div className="flex flex-wrap items-end gap-6">
      {/* Search */}
      <div className="flex-1 min-w-[200px]">
        <label className="block font-mono text-[10px] uppercase tracking-[0.1em] text-ink/60 mb-1">
          SEARCH
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="
              w-full border border-ink bg-transparent px-3 py-1.5
              font-mono text-sm text-ink placeholder:text-ink/40
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper
            "
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchValue && (
            <button
              onClick={handleSearchClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink/50 hover:text-ink font-mono text-xs"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter groups — filing-tab style */}
      {filterConfig.map((group) => (
        <div key={group.key}>
          <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-ink/60 mb-1">
            {group.label}
          </span>
          <div className="flex border-b border-ink">
            {/* "All" tab */}
            <button
              className={`
                px-3 py-1 font-mono text-[11px] uppercase tracking-wider
                border border-b-0 border-transparent
                transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1
                ${
                  !filters[group.key]
                    ? "bg-manila border-ink relative top-[1px] border-b-manila z-10 font-medium"
                    : "text-ink/60 hover:bg-manila/20"
                }
              `}
              onClick={() => onFilterChange(group.key, undefined)}
            >
              ALL
            </button>
            {group.options.map((opt) => {
              const isActive = filters[group.key] === opt.value;
              return (
                <button
                  key={opt.value}
                  className={`
                    px-3 py-1 font-mono text-[11px] uppercase tracking-wider
                    border border-b-0 border-transparent
                    transition-colors
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1
                    ${
                      isActive
                        ? "bg-manila border-ink relative top-[1px] border-b-manila z-10 font-medium"
                        : "text-ink/60 hover:bg-manila/20"
                    }
                  `}
                  onClick={() => onFilterChange(group.key, opt.value)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
