// src/hooks/orders/useRecentOrdersCount.ts
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/domain/order-service'; // Adjust path if necessary

export const RECENT_ORDERS_COUNT_QUERY_KEY = 'recentOrdersCount';

export function useRecentOrdersCount(daysAgo: number = 7) {
  return useQuery<number, Error>({
    queryKey: [RECENT_ORDERS_COUNT_QUERY_KEY, daysAgo],
    queryFn: () => orderService.getRecentOrdersCount(daysAgo),
    staleTime: 5 * 60 * 1000, // 5 minutes, or longer if this data isn't highly dynamic
    refetchOnWindowFocus: true,
  });
}
