import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchListings } from '@/lib/api-client';

export function useListings(params: Record<string, any>) {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: () => fetchListings(params),
    placeholderData: keepPreviousData,
  });
}
