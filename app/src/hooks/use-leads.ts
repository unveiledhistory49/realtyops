import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchLeads } from '@/lib/api-client';

export function useLeads(params: Record<string, any>) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => fetchLeads(params),
    placeholderData: keepPreviousData,
  });
}
