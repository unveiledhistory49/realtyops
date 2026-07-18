"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLead } from "@/lib/api-client";
import type { Lead } from "@/lib/schemas";
import type { PaginatedResponse } from "@/lib/api-client";
import { useState, useCallback } from "react";

export interface ConflictInfo {
  updatedBy: string;
  currentRecord: Lead;
}

interface MutateArgs {
  leadId: string;
  data: Partial<Lead>;
  simulateConflict?: boolean;
  simulateError?: boolean;
}

export function useLeadMutation() {
  const queryClient = useQueryClient();
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);
  const [mutationError, setMutationError] = useState<Error | null>(null);
  const [lastVars, setLastVars] = useState<MutateArgs | null>(null);

  const mutation = useMutation({
    mutationFn: (vars: MutateArgs) =>
      updateLead(vars.leadId, vars.data, {
        simulateConflict: vars.simulateConflict,
        simulateError: vars.simulateError,
      }),

    onMutate: async (vars: MutateArgs) => {
      setConflict(null);
      setMutationError(null);
      setLastVars(vars);

      /* Cancel in-flight queries so they don't overwrite our optimistic data */
      await queryClient.cancelQueries({ queryKey: ["leads"] });
      await queryClient.cancelQueries({ queryKey: ["lead", vars.leadId] });

      /* Snapshot for rollback */
      const previousLeadsQueries = queryClient.getQueriesData<
        PaginatedResponse<Lead>
      >({ queryKey: ["leads"] });

      /* Optimistically update every leads list query in the cache */
      queryClient.setQueriesData<PaginatedResponse<Lead>>(
        { queryKey: ["leads"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((lead) =>
              lead.id === vars.leadId ? { ...lead, ...vars.data } : lead
            ),
          };
        }
      );

      return { previousLeadsQueries };
    },

    onError: (err: any, vars, context) => {
      if (err.isConflict) {
        setConflict({
          updatedBy: err.updatedBy,
          currentRecord: err.currentRecord,
        });
        /* Replace cached version with server's authoritative record */
        queryClient.setQueriesData<PaginatedResponse<Lead>>(
          { queryKey: ["leads"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              data: old.data.map((lead) =>
                lead.id === vars.leadId ? err.currentRecord : lead
              ),
            };
          }
        );
      } else {
        setMutationError(err as Error);
        /* Rollback all leads queries to pre-optimistic snapshot */
        if (context?.previousLeadsQueries) {
          for (const [queryKey, data] of context.previousLeadsQueries) {
            queryClient.setQueryData(queryKey, data);
          }
        }
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  const retry = useCallback(() => {
    if (lastVars) {
      mutation.mutate(lastVars);
    }
  }, [lastVars, mutation]);

  const clearError = useCallback(() => {
    setConflict(null);
    setMutationError(null);
  }, []);

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    error: mutationError,
    conflict,
    retry,
    clearError,
    /** ID of the lead currently being mutated, for per-row state */
    mutatingLeadId: lastVars?.leadId ?? null,
  };
}
