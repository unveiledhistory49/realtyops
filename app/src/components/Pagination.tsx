"use client";

import React, { useMemo } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

/**
 * Generate page numbers with ellipsis for large page counts.
 * Always shows first, last, and ±1 around current.
 */
function getVisiblePages(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("…");

  pages.push(total);

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  const visiblePages = useMemo(
    () => getVisiblePages(currentPage, totalPages),
    [currentPage, totalPages]
  );

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      {/* Record count */}
      <div className="font-tabular text-xs text-ink/60 uppercase tracking-wider">
        SHOWING {start}–{end} OF {total} RECORDS
      </div>

      {/* Page tabs */}
      <div className="flex border-b border-ink">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="
            px-3 py-1 font-mono text-[11px] uppercase tracking-wider
            border border-b-0 border-transparent
            disabled:text-hairline disabled:cursor-not-allowed
            hover:bg-manila/20
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1
          "
          aria-label="Previous page"
        >
          PREV
        </button>

        {visiblePages.map((page, i) =>
          page === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 py-1 font-mono text-xs text-ink/40 self-end"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                px-3 py-1 font-tabular text-[11px]
                border border-b-0 border-transparent
                transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1
                ${
                  page === currentPage
                    ? "bg-manila border-ink relative top-[1px] border-b-manila z-10 font-medium text-ink"
                    : "text-ink/60 hover:bg-manila/20"
                }
              `}
              aria-current={page === currentPage ? "page" : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="
            px-3 py-1 font-mono text-[11px] uppercase tracking-wider
            border border-b-0 border-transparent
            disabled:text-hairline disabled:cursor-not-allowed
            hover:bg-manila/20
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1
          "
          aria-label="Next page"
        >
          NEXT
        </button>
      </div>
    </div>
  );
}
