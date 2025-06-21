// src/hooks/products/useUnitPrices.ts
import { useQuery } from '@tanstack/react-query';
import { productService, type UnitPrice } from '@/services/domain/product-service'; // Adjust path if needed

export const UNIT_PRICES_QUERY_KEY_PREFIX = 'unitPrices';

export function useUnitPrices() {
  return useQuery<UnitPrice[], Error>({
    queryKey: [UNIT_PRICES_QUERY_KEY_PREFIX],
    queryFn: () => productService.getUnitPrices(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export const UNIT_PRICES_COUNT_QUERY_KEY = 'unitPricesCount';

export function useUnitPricesCount() {
  return useQuery<number, Error>({
    queryKey: [UNIT_PRICES_COUNT_QUERY_KEY],
    queryFn: () => productService.getUnitPricesCount(),
    staleTime: 5 * 60 * 1000,
  });
}
