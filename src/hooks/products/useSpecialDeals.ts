// src/hooks/products/useSpecialDeals.ts
import { useQuery } from '@tanstack/react-query';
import { productService, type SpecialDeal } from '@/services/domain/product-service'; // Adjust path if needed

export const SPECIAL_DEALS_QUERY_KEY_PREFIX = 'specialDeals';

export function useSpecialDeals() {
  return useQuery<SpecialDeal[], Error>({
    queryKey: [SPECIAL_DEALS_QUERY_KEY_PREFIX],
    queryFn: () => productService.getSpecialDeals(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
