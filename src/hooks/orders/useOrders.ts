// src/hooks/orders/useOrders.ts
import { useQuery } from '@tanstack/react-query';
import { orderService, type Order, type GetOrdersParams } from '@/services/domain/order-service'; // Adjust path if necessary

export const ORDERS_QUERY_KEY_PREFIX = 'orders';

// Define a more specific type for the hook's return, including pagination info
export interface UseOrdersQueryResult {
  orders: Order[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  // Add other query props as needed, e.g., refetch, isFetching
}

// The actual data returned by orderService.getOrders
interface GetOrdersServiceResponse {
    orders: Order[];
    lastDocId: string | null;
}

export function useOrders(params: GetOrdersParams = {}): UseOrdersQueryResult {
  const queryKey = [ORDERS_QUERY_KEY_PREFIX, params];

  const { data, isLoading, isError, error } = useQuery<GetOrdersServiceResponse, Error, GetOrdersServiceResponse, any[]>({
    queryKey: queryKey,
    queryFn: async () => {
      // orderService.getOrders already returns an object { orders: Order[]; lastDocId: string | null; }
      return orderService.getOrders(params);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Good for admin panels
  });

  return {
    orders: data?.orders || [], // Default to empty array if data is undefined
    isLoading,
    isError,
    error: error || null,
    // lastDocId: data?.lastDocId // Could be returned for manual pagination control
  };
}
