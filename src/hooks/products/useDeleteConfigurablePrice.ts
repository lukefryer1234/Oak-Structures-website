// src/hooks/products/useDeleteConfigurablePrice.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/domain/product-service';
import { CONFIGURABLE_PRICES_QUERY_KEY_PREFIX } from './useConfigurablePrices';
import { useToast } from '@/hooks/use-toast';

export function useDeleteConfigurablePrice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string, unknown>({ // string is the id
    mutationFn: (id: string) => productService.deleteConfigurablePrice(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: [CONFIGURABLE_PRICES_QUERY_KEY_PREFIX] });
      toast({
        title: "Price Configuration Deleted",
        description: `Price configuration (ID: ${id}) deleted successfully.`,
      });
    },
    onError: (error: Error, id) => {
      toast({
        variant: "destructive",
        title: "Failed to Delete Price",
        description: `Error deleting price configuration (ID: ${id}): ${error.message}`,
      });
    },
  });
}
