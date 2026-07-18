"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useCallback, Suspense } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FilterBar } from "@/components/FilterBar";
import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { LeadDetailDrawer } from "@/components/LeadDetailDrawer";
import { StatusStamp } from "@/components/StatusStamp";
import { RowActions } from "@/components/RowActions";
import { useListings } from "@/hooks/use-listings";
import { useLeads } from "@/hooks/use-leads";
import { useLeadMutation } from "@/hooks/use-lead-mutation";
import type { Listing, Lead } from "@/lib/schemas";
import type { ColumnDef } from "@tanstack/react-table";

/* ─── Column Definitions ─── */

const listingColumns: ColumnDef<Listing>[] = [
  {
    accessorKey: "address",
    header: "ADDRESS",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "price",
    header: "PRICE",
    cell: ({ getValue }) => (
      <span className="font-tabular">
        ${getValue<number>().toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => (
      <StatusStamp status={row.original.status} recordId={row.original.id} />
    ),
  },
  {
    accessorKey: "beds",
    header: "BEDS",
    cell: ({ getValue }) => (
      <span className="font-tabular">{getValue<number>()}</span>
    ),
  },
  {
    accessorKey: "sqft",
    header: "SQFT",
    cell: ({ getValue }) => (
      <span className="font-tabular">
        {getValue<number>().toLocaleString()}
      </span>
    ),
  },
  {
    id: "agent",
    header: "AGENT",
    accessorFn: (row) => row.agentId,
    cell: ({ getValue }) => <span>Agent {getValue<string>()}</span>,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <RowActions
        type="listing"
        record={row.original}
        onAction={() => {}}
      />
    ),
  },
];

const leadColumns = (
  onAction: (action: string, lead: Lead) => void
): ColumnDef<Lead>[] => [
  {
    accessorKey: "name",
    header: "NAME",
    cell: ({ getValue }) => (
      <span className="font-medium">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "EMAIL",
    cell: ({ getValue }) => (
      <span className="text-ink/70 text-sm">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: "PHONE",
    cell: ({ getValue }) => (
      <span className="font-tabular text-sm">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => (
      <StatusStamp status={row.original.status} recordId={row.original.id} />
    ),
  },
  {
    accessorKey: "lastActivityAt",
    header: "LAST ACTIVITY",
    cell: ({ getValue }) => (
      <span className="font-tabular text-sm">
        {formatRelativeTime(getValue<string>())}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <RowActions
        type="lead"
        record={row.original}
        onAction={(action) => onAction(action, row.original)}
      />
    ),
  },
];

/* ─── Helpers ─── */

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/* ─── Dashboard Shell (inner, with searchParams access) ─── */

function DashboardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /* Active tab */
  const activeTab =
    (searchParams.get("view") as "listings" | "leads") || "listings";

  /* Parse URL params into filter objects */
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "25", 10);
  const sort = searchParams.get("sort") || undefined;
  const dir = (searchParams.get("dir") as "asc" | "desc") || undefined;
  const search = searchParams.get("search") || undefined;
  const statusFilter = searchParams.get("status") || undefined;
  const agentFilter = searchParams.get("agent") || undefined;
  const bedsFilter = searchParams.get("beds") || undefined;
  const priceMinFilter = searchParams.get("priceMin") || undefined;
  const priceMaxFilter = searchParams.get("priceMax") || undefined;

  /* Data hooks */
  const listingsQuery = useListings({
    page,
    pageSize,
    sort,
    dir,
    search,
    status: statusFilter,
    agent: agentFilter,
    beds: bedsFilter,
    priceMin: priceMinFilter,
    priceMax: priceMaxFilter,
  });

  const leadsQuery = useLeads({
    page,
    pageSize,
    sort,
    dir,
    search,
    status: statusFilter,
    agent: agentFilter,
  });

  const leadMutation = useLeadMutation();

  /* Drawer state */
  const [drawerLeadId, setDrawerLeadId] = useState<string | null>(null);

  /* URL update helper — replace, not push, for filter tweaks */
  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /* Tab switch */
  const switchTab = useCallback(
    (tab: "listings" | "leads") => {
      const params = new URLSearchParams();
      params.set("view", tab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname]
  );

  /* Filter change */
  const handleFilterChange = useCallback(
    (key: string, value: string | undefined) => {
      updateParams({ [key]: value, page: "1" });
    },
    [updateParams]
  );

  /* Pagination */
  const handlePageChange = useCallback(
    (newPage: number) => {
      updateParams({ page: String(newPage) });
    },
    [updateParams]
  );

  /* Lead actions */
  const handleLeadAction = useCallback(
    (action: string, lead: Lead) => {
      switch (action) {
        case "view":
          setDrawerLeadId(lead.id);
          break;
        case "contact":
          leadMutation.mutate({
            leadId: lead.id,
            data: { status: "contacted" },
          });
          break;
        case "close":
          leadMutation.mutate({
            leadId: lead.id,
            data: { status: "closed" },
          });
          break;
        case "lose":
          leadMutation.mutate({
            leadId: lead.id,
            data: { status: "lost", lostReason: "No response" },
          });
          break;
        default:
          break;
      }
    },
    [leadMutation]
  );

  /* Current data based on active tab */
  const isListings = activeTab === "listings";
  const query = isListings ? listingsQuery : leadsQuery;
  const totalPages = query.data
    ? Math.ceil(query.data.total / pageSize)
    : 0;

  /* Filter configs */
  const listingFilterConfig = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "pending", label: "Pending" },
        { value: "closed", label: "Closed" },
      ],
    },
    {
      key: "beds",
      label: "Beds",
      options: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4+" },
      ],
    },
  ];

  const leadFilterConfig = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "new", label: "New" },
        { value: "contacted", label: "Contacted" },
        { value: "showing", label: "Showing" },
        { value: "offer", label: "Offer" },
        { value: "closed", label: "Closed" },
        { value: "lost", label: "Lost" },
      ],
    },
  ];

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={switchTab}>
      {/* Toolbar */}
      <div className="border-b border-hairline px-6 py-3">
        <FilterBar
          filters={{
            status: statusFilter,
            agent: agentFilter,
            beds: bedsFilter,
            search,
          }}
          onFilterChange={handleFilterChange}
          filterConfig={isListings ? listingFilterConfig : leadFilterConfig}
          searchPlaceholder={
            isListings
              ? "Search addresses…"
              : "Search leads by name or email…"
          }
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isListings ? (
          <DataTable
            columns={listingColumns}
            data={(listingsQuery.data?.data as Listing[]) || []}
            isLoading={listingsQuery.isLoading}
          />
        ) : (
          <DataTable
            columns={leadColumns(handleLeadAction)}
            data={(leadsQuery.data?.data as Lead[]) || []}
            isLoading={leadsQuery.isLoading}
            onRowClick={(row) => setDrawerLeadId((row as Lead).id)}
            mutationState={leadMutation}
          />
        )}
      </div>

      {/* Pagination */}
      {query.data && query.data.total > 0 && (
        <div className="border-t border-hairline px-6 py-3">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            total={query.data.total}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Lead detail drawer */}
      <LeadDetailDrawer
        leadId={drawerLeadId}
        isOpen={drawerLeadId !== null}
        onClose={() => setDrawerLeadId(null)}
      />
    </DashboardLayout>
  );
}

/* ─── Suspense boundary for useSearchParams ─── */

export function DashboardShell() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-paper">
          <span className="font-stamp text-ink/50">Loading ledger…</span>
        </div>
      }
    >
      <DashboardInner />
    </Suspense>
  );
}
