// src/hooks/products/useConfigurablePrices.ts
import { useQuery } from '@tanstack/react-query';
import { productService, type ConfigurablePrice } from '@/services/domain/product-service';

export const CONFIGURABLE_PRICES_QUERY_KEY_PREFIX = 'configurablePrices';

export function useConfigurablePrices() {
  return useQuery<ConfigurablePrice[], Error>({
    queryKey: [CONFIGURABLE_PRICES_QUERY_KEY_PREFIX],
    queryFn: () => productService.getConfigurablePrices(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export const CONFIGURABLE_PRICES_COUNT_QUERY_KEY = 'configurablePricesCount';

export function useConfigurablePricesCount() {
  return useQuery<number, Error>({
    queryKey: [CONFIGURABLE_PRICES_COUNT_QUERY_KEY],
    queryFn: () => productService.getConfigurablePricesCount(),
    staleTime: 5 * 60 * 1000,
  });
}
