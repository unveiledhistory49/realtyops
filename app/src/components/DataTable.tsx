"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";

interface MutationState {
  isPending: boolean;
  error: Error | null;
  conflict: { updatedBy: string; currentRecord: any } | null;
  retry: () => void;
  clearError: () => void;
  mutatingLeadId: string | null;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  mutationState?: MutationState;
}

export function DataTable<TData extends { id?: string }>({
  columns,
  data,
  isLoading,
  onRowClick,
  mutationState,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="w-full p-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-10 mb-1 bg-hairline/30 animate-pulse border-b border-hairline"
          />
        ))}
      </div>
    );
  }

  /* ── Empty state ── */
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <p className="font-mono text-sm text-ink/50 uppercase tracking-wider">
          No records match these filters
        </p>
        <p className="font-mono text-xs text-ink/40 mt-2">
          Try clearing a filter or broadening your search
        </p>
      </div>
    );
  }

  const isMutatingRow = (row: TData) =>
    mutationState?.mutatingLeadId &&
    (row as any).id === mutationState.mutatingLeadId;

  const hasRowError = (row: TData) =>
    isMutatingRow(row) && mutationState?.error;

  const hasRowConflict = (row: TData) =>
    isMutatingRow(row) && mutationState?.conflict;

  return (
    <div className="w-full">
      {/* ── Desktop table ── */}
      <table className="w-full border-collapse hidden md:table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-ink">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2.5 text-left font-mono text-[11px] font-normal uppercase tracking-[0.08em] text-paper border-b border-ink"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const isOptimistic =
              isMutatingRow(row.original) && mutationState?.isPending;
            const rowError = hasRowError(row.original);
            const rowConflict = hasRowConflict(row.original);

            return (
              <React.Fragment key={row.id}>
                <tr
                  onClick={() => onRowClick?.(row.original)}
                  className={`
                    border-b border-hairline
                    transition-colors
                    group
                    ${onRowClick ? "cursor-pointer" : ""}
                    ${
                      isOptimistic
                        ? "bg-manila/15"
                        : "hover:bg-manila/10"
                    }
                  `}
                  data-optimistic={isOptimistic ? "true" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-ink whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>

                {/* Inline error row */}
                {rowError && (
                  <tr className="border-b border-hairline bg-stamp-red/5">
                    <td colSpan={columns.length} className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] uppercase tracking-wider text-stamp-red border border-stamp-red px-2 py-0.5">
                          UPDATE FAILED
                        </span>
                        <span className="font-mono text-xs text-ink/70">
                          {mutationState?.error?.message || "Could not save changes"}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            mutationState?.retry();
                          }}
                          className="font-mono text-[11px] uppercase tracking-wider text-ink border border-ink px-2 py-0.5 hover:bg-manila transition-colors ml-auto"
                        >
                          RETRY
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            mutationState?.clearError();
                          }}
                          className="font-mono text-[11px] text-ink/50 hover:text-ink"
                          aria-label="Dismiss error"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Inline conflict row */}
                {rowConflict && (
                  <tr className="border-b border-hairline bg-manila/10">
                    <td colSpan={columns.length} className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[11px] uppercase tracking-wider text-stamp-red">
                          CONFLICT
                        </span>
                        <span className="font-mono text-xs text-ink/70">
                          Updated by{" "}
                          <strong>
                            {mutationState?.conflict?.updatedBy}
                          </strong>{" "}
                          moments ago — showing their version
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            mutationState?.clearError();
                          }}
                          className="font-mono text-[11px] text-ink/50 hover:text-ink ml-auto"
                          aria-label="Dismiss notice"
                        >
                          DISMISS
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* ── Mobile stacked cards ── */}
      <div className="md:hidden divide-y divide-hairline">
        {table.getRowModel().rows.map((row) => (
          <div
            key={row.id}
            onClick={() => onRowClick?.(row.original)}
            className={`
              p-4 space-y-2
              ${onRowClick ? "cursor-pointer" : ""}
              hover:bg-manila/10
              transition-colors
              group
            `}
          >
            {row.getVisibleCells().map((cell) => {
              const colId = cell.column.id;
              if (colId === "actions") {
                return (
                  <div
                    key={cell.id}
                    className="pt-2 border-t border-hairline mt-2"
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </div>
                );
              }
              return (
                <div
                  key={cell.id}
                  className="flex justify-between items-center"
                >
                  <span className="font-mono text-[10px] uppercase tracking-wider text-ink/50">
                    {typeof cell.column.columnDef.header === "string"
                      ? cell.column.columnDef.header
                      : colId.toUpperCase()}
                  </span>
                  <span className="text-sm text-ink">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
