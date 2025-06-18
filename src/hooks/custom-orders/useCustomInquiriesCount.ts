// src/hooks/custom-orders/useCustomInquiriesCount.ts
import { useQuery } from '@tanstack/react-query';
import { customOrderService } from '@/services/domain/custom-order-service'; // Adjust path if needed

export const CUSTOM_INQUIRIES_COUNT_QUERY_KEY = 'customInquiriesCount';

export function useCustomInquiriesCount() {
  return useQuery<number, Error>({
    queryKey: [CUSTOM_INQUIRIES_COUNT_QUERY_KEY],
    queryFn: () => customOrderService.getPendingInquiriesCount(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}
