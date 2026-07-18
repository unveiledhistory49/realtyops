import type { Lead, Listing } from "./schemas";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Activity {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details?: string;
}

export interface LeadWithActivities extends Lead {
  activities: Activity[];
}

export async function fetchListings(
  params?: Record<string, unknown>
): Promise<PaginatedResponse<Listing>> {
  const sp = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        sp.append(key, String(value));
      }
    }
  }
  const res = await fetch(`/api/listings?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch listings");
  return res.json();
}

export async function fetchLeads(
  params?: Record<string, unknown>
): Promise<PaginatedResponse<Lead>> {
  const sp = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        sp.append(key, String(value));
      }
    }
  }
  const res = await fetch(`/api/leads?${sp.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

export async function fetchLead(id: string): Promise<LeadWithActivities> {
  const res = await fetch(`/api/leads/${id}`);
  if (!res.ok) throw new Error("Failed to fetch lead");
  return res.json();
}

interface UpdateLeadOptions {
  simulateConflict?: boolean;
  simulateError?: boolean;
}

export async function updateLead(
  id: string,
  data: Partial<Lead>,
  options?: UpdateLeadOptions
): Promise<Lead> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options?.simulateConflict) {
    headers["X-Simulate-Conflict"] = "true";
  }
  if (options?.simulateError) {
    headers["X-Simulate-Error"] = "true";
  }

  const res = await fetch(`/api/leads/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    if (res.status === 409) {
      const errorData = await res.json();
      throw { isConflict: true, ...errorData };
    }
    throw new Error("Failed to update lead");
  }

  return res.json();
}
