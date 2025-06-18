// src/hooks/orders/useUpdateOrderStatus.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService, type OrderStatus, type Order } from '@/services/domain/order-service'; // Adjust path if necessary
import { ORDERS_QUERY_KEY_PREFIX } from './useOrders'; // To invalidate the orders list
import { useToast } from '@/hooks/use-toast'; // Assuming a global toast hook

interface UpdateOrderStatusVariables {
  orderId: string;
  status: OrderStatus;
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<Partial<Order>, Error, UpdateOrderStatusVariables, unknown>({
    mutationFn: async ({ orderId, status }: UpdateOrderStatusVariables) => {
      return orderService.updateOrderStatus(orderId, status);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch the orders list to reflect the change
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY_PREFIX] });

      // Optionally, you can update the specific order in the cache if needed
      // queryClient.setQueryData(['order', variables.orderId], (oldData: Order | undefined) =>
      //   oldData ? { ...oldData, status: variables.status, updatedAt: data.updatedAt } : undefined
      // );

      toast({
        title: "Order Status Updated",
        description: `Order ${variables.orderId} status changed to ${variables.status}.`,
      });
    },
    onError: (error, variables) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: `Could not update status for order ${variables.orderId}: ${error.message}`,
      });
    },
  });
}
